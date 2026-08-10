import { NextRequest, NextResponse } from "next/server"
import { errorResponse } from "@/lib/utils/api-response"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { getJakartaDateString } from "@/lib/utils/format"
import { normalizePaymentMethod } from "@/services/chatbot/intent-parser"
import type {
  ChatbotAction,
  BatchCreateTransactionsPayload,
  BatchDeleteTransactionsPayload,
  BatchEditTransactionsPayload,
  DeleteAllTransactionsPayload,
  CreateTransactionPayload,
  BatchActionResult,
} from "@/types/rag"

const MIN_MBANKING_BALANCE = 50000
const MAX_BATCH_SIZE = 20

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return errorResponse("Tidak diizinkan", 401)
    }

    const body = await request.json()
    const { action, payload } = body as { action: ChatbotAction; payload: unknown }

    switch (action) {
      case "batch_create_transactions":
        return await handleBatchCreate(session.userId, payload as BatchCreateTransactionsPayload)

      case "batch_delete_transactions":
        return await handleBatchDelete(session.userId, payload as BatchDeleteTransactionsPayload)

      case "batch_edit_transactions":
        return await handleBatchEdit(session.userId, payload as BatchEditTransactionsPayload)

      case "delete_all_transactions":
        return await handleDeleteAll(session.userId, payload as DeleteAllTransactionsPayload)

      default:
        return errorResponse("Aksi batch tidak dikenal", 400)
    }
  } catch (error) {
    console.error("Batch action error:", error)
    return errorResponse(error instanceof Error ? error.message : "Terjadi kesalahan server", 500)
  }
}

async function handleBatchCreate(
  userId: string,
  payload: BatchCreateTransactionsPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.transactions || !Array.isArray(payload.transactions)) {
    return errorResponse("Data transaksi tidak valid", 400)
  }

  if (payload.transactions.length === 0) {
    return errorResponse("Tidak ada transaksi untuk ditambahkan", 400)
  }

  if (payload.transactions.length > MAX_BATCH_SIZE) {
    return errorResponse(`Maksimal ${MAX_BATCH_SIZE} transaksi per batch`, 400)
  }

  for (let i = 0; i < payload.transactions.length; i++) {
    const tx = payload.transactions[i]
    if (!tx.amount || !tx.type || !tx.category || !tx.payment_method) {
      return errorResponse(`Transaksi #${i + 1} tidak lengkap`, 400)
    }
    const normalizedPaymentMethod = normalizePaymentMethod(tx.payment_method)
    if (!normalizedPaymentMethod) {
      return errorResponse(`Transaksi #${i + 1}: metode pembayaran tidak dikenali, gunakan Cash atau M-Banking`, 400)
    }
    payload.transactions[i] = { ...tx, payment_method: normalizedPaymentMethod }
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  let mbankingChange = 0
  let cashChange = 0

  for (const tx of payload.transactions) {
    const change = tx.type === "expense" ? -tx.amount : tx.amount
    if (tx.payment_method === "mbanking") {
      mbankingChange += change
    } else {
      cashChange += change
    }
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  if (newCashBalance < 0) {
    return errorResponse(`Saldo Cash tidak cukup. Perubahan total: Rp ${Math.abs(cashChange).toLocaleString("id-ID")}`, 400)
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return errorResponse(`Saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
  }

  const today = getJakartaDateString()
  const transactionsToInsert = payload.transactions.map((tx: CreateTransactionPayload) => ({
    user_id: userId,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    description: tx.description || null,
    payment_method: tx.payment_method,
    transaction_date: tx.transaction_date || today,
  }))

  const { data: insertedTransactions, error: insertError } = await supabase
    .from("transactions")
    .insert(transactionsToInsert)
    .select()

  if (insertError) {
    return errorResponse(insertError.message, 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    const insertedIds = insertedTransactions?.map((tx) => tx.id) || []
    if (insertedIds.length > 0) {
      await supabase.from("transactions").delete().in("id", insertedIds)
    }
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  const result: BatchActionResult = {
    success: true,
    totalRequested: payload.transactions.length,
    totalSucceeded: insertedTransactions?.length || 0,
    totalFailed: 0,
    totalBalanceChange: {
      mbanking: mbankingChange,
      cash: cashChange,
    },
    results: (insertedTransactions || []).map((tx, i) => ({
      index: i,
      success: true,
      transactionId: tx.id,
    })),
  }

  return NextResponse.json({
    success: true,
    message: `${result.totalSucceeded} transaksi berhasil ditambahkan`,
    result,
  })
}

async function handleBatchDelete(
  userId: string,
  payload: BatchDeleteTransactionsPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.filter || Object.keys(payload.filter).length === 0) {
    return errorResponse("Filter tidak valid. Harap tentukan minimal 1 kriteria filter.", 400)
  }

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)

  if (payload.filter.category) {
    query = query.eq("category", payload.filter.category)
  }
  if (payload.filter.type) {
    query = query.eq("type", payload.filter.type)
  }
  if (payload.filter.payment_method) {
    query = query.eq("payment_method", payload.filter.payment_method)
  }
  if (payload.filter.startDate) {
    query = query.gte("transaction_date", payload.filter.startDate)
  }
  if (payload.filter.endDate) {
    query = query.lte("transaction_date", payload.filter.endDate)
  }

  const { data: transactions, error: fetchError } = await query

  if (fetchError) {
    return errorResponse(fetchError.message, 500)
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Tidak ada transaksi yang sesuai dengan filter",
      result: {
        success: true,
        totalRequested: 0,
        totalSucceeded: 0,
        totalFailed: 0,
        totalBalanceChange: { mbanking: 0, cash: 0 },
        results: [],
      },
    })
  }

  if (transactions.length > MAX_BATCH_SIZE) {
    return errorResponse(`Terlalu banyak transaksi (${transactions.length}). Maksimal ${MAX_BATCH_SIZE} transaksi per batch. Persempit filter.`, 400)
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  let mbankingChange = 0
  let cashChange = 0

  for (const tx of transactions) {
    const change = tx.type === "expense" ? Number(tx.amount) : -Number(tx.amount)
    if (tx.payment_method === "mbanking") {
      mbankingChange += change
    } else {
      cashChange += change
    }
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  if (newCashBalance < 0) {
    return errorResponse("Tidak dapat menghapus: saldo Cash akan menjadi negatif", 400)
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return errorResponse(`Tidak dapat menghapus: saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
  }

  const transactionIds = transactions.map((tx) => tx.id)
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds)

  if (deleteError) {
    return errorResponse(deleteError.message, 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    await supabase.from("transactions").insert(transactions)
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  const result: BatchActionResult = {
    success: true,
    totalRequested: transactions.length,
    totalSucceeded: transactions.length,
    totalFailed: 0,
    totalBalanceChange: {
      mbanking: mbankingChange,
      cash: cashChange,
    },
    results: transactions.map((tx, i) => ({
      index: i,
      success: true,
      transactionId: tx.id,
      message: `${tx.category}: Rp ${Number(tx.amount).toLocaleString("id-ID")}`,
    })),
  }

  return NextResponse.json({
    success: true,
    message: `${result.totalSucceeded} transaksi berhasil dihapus`,
    result,
  })
}

async function handleBatchEdit(
  userId: string,
  payload: BatchEditTransactionsPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.updates || !Array.isArray(payload.updates)) {
    return errorResponse("Data update tidak valid", 400)
  }

  if (payload.updates.length === 0) {
    return errorResponse("Tidak ada transaksi untuk diubah", 400)
  }

  if (payload.updates.length > MAX_BATCH_SIZE) {
    return errorResponse(`Maksimal ${MAX_BATCH_SIZE} transaksi per batch edit`, 400)
  }

  for (let i = 0; i < payload.updates.length; i++) {
    const update = payload.updates[i]
    if (!update.transactionId) {
      return errorResponse(`Update #${i + 1} tidak memiliki transactionId`, 400)
    }
    if (!update.updates || Object.keys(update.updates).length === 0) {
      return errorResponse(`Update #${i + 1} tidak memiliki perubahan`, 400)
    }
    if (update.updates.payment_method !== undefined) {
      const normalizedPaymentMethod = normalizePaymentMethod(update.updates.payment_method)
      if (!normalizedPaymentMethod) {
        return errorResponse(`Update #${i + 1}: metode pembayaran tidak dikenali, gunakan Cash atau M-Banking`, 400)
      }
      update.updates = { ...update.updates, payment_method: normalizedPaymentMethod }
    }
  }

  const transactionIds = payload.updates.map((u) => u.transactionId)

  const { data: existingTransactions, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .in("id", transactionIds)

  if (fetchError) {
    return errorResponse(fetchError.message, 500)
  }

  if (!existingTransactions || existingTransactions.length !== transactionIds.length) {
    const foundIds = new Set(existingTransactions?.map((tx) => tx.id) || [])
    const missingIds = transactionIds.filter((id) => !foundIds.has(id))
    return errorResponse(`Transaksi tidak ditemukan: ${missingIds.length} transaksi tidak valid atau bukan milik user`, 404)
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  let mbankingChange = 0
  let cashChange = 0

  const transactionMap = new Map(existingTransactions.map((tx) => [tx.id, tx]))

  for (const update of payload.updates) {
    const oldTx = transactionMap.get(update.transactionId)!
    const newUpdates = update.updates

    const oldAmount = Number(oldTx.amount)
    const oldType = oldTx.type as "income" | "expense"
    const oldPaymentMethod = oldTx.payment_method as "mbanking" | "cash"

    const newAmount = newUpdates.amount ?? oldAmount
    const newType = newUpdates.type ?? oldType
    const newPaymentMethod = newUpdates.payment_method ?? oldPaymentMethod

    const oldChange = oldType === "expense" ? oldAmount : -oldAmount
    if (oldPaymentMethod === "mbanking") {
      mbankingChange += oldChange
    } else {
      cashChange += oldChange
    }

    const newChange = newType === "expense" ? -newAmount : newAmount
    if (newPaymentMethod === "mbanking") {
      mbankingChange += newChange
    } else {
      cashChange += newChange
    }
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  if (newCashBalance < 0) {
    return errorResponse("Tidak dapat mengubah: saldo Cash akan menjadi negatif", 400)
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return errorResponse(`Tidak dapat mengubah: saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
  }

  const originalTransactions = [...existingTransactions]

  const updateResults: Array<{ index: number; success: boolean; message?: string; transactionId?: string }> = []

  for (let i = 0; i < payload.updates.length; i++) {
    const update = payload.updates[i]
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        ...(update.updates.amount !== undefined && { amount: update.updates.amount }),
        ...(update.updates.type !== undefined && { type: update.updates.type }),
        ...(update.updates.category !== undefined && { category: update.updates.category }),
        ...(update.updates.description !== undefined && { description: update.updates.description }),
        ...(update.updates.payment_method !== undefined && { payment_method: update.updates.payment_method }),
        ...(update.updates.transaction_date !== undefined && { transaction_date: update.updates.transaction_date }),
      })
      .eq("id", update.transactionId)
      .eq("user_id", userId)

    if (updateError) {
      updateResults.push({ index: i, success: false, message: updateError.message, transactionId: update.transactionId })
    } else {
      const oldTx = transactionMap.get(update.transactionId)!
      updateResults.push({
        index: i,
        success: true,
        transactionId: update.transactionId,
        message: `${oldTx.category}: Rp ${Number(oldTx.amount).toLocaleString("id-ID")}`,
      })
    }
  }

  const failedCount = updateResults.filter((r) => !r.success).length

  if (failedCount > 0 && failedCount === payload.updates.length) {
    return errorResponse("Semua update gagal", 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    for (const original of originalTransactions) {
      await supabase
        .from("transactions")
        .update({
          amount: original.amount,
          type: original.type,
          category: original.category,
          description: original.description,
          payment_method: original.payment_method,
          transaction_date: original.transaction_date,
        })
        .eq("id", original.id)
    }
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  const successCount = updateResults.filter((r) => r.success).length

  const result: BatchActionResult = {
    success: true,
    totalRequested: payload.updates.length,
    totalSucceeded: successCount,
    totalFailed: failedCount,
    totalBalanceChange: {
      mbanking: mbankingChange,
      cash: cashChange,
    },
    results: updateResults,
  }

  return NextResponse.json({
    success: true,
    message: `${successCount} transaksi berhasil diubah`,
    result,
  })
}

async function handleDeleteAll(
  userId: string,
  payload: DeleteAllTransactionsPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (payload.confirmationText !== "HAPUS SEMUA") {
    return errorResponse("Konfirmasi tidak valid. Ketik 'HAPUS SEMUA' untuk melanjutkan.", 400)
  }

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)

  if (payload.month && payload.year) {
    const startDate = `${payload.year}-${String(payload.month).padStart(2, "0")}-01`
    const lastDay = new Date(payload.year, payload.month, 0).getDate()
    const endDate = `${payload.year}-${String(payload.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate)
  }

  const { data: transactions, error: fetchError } = await query

  if (fetchError) {
    return errorResponse(fetchError.message, 500)
  }

  if (!transactions || transactions.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Tidak ada transaksi untuk dihapus",
      result: {
        success: true,
        totalRequested: 0,
        totalSucceeded: 0,
        totalFailed: 0,
        totalBalanceChange: { mbanking: 0, cash: 0 },
        results: [],
      },
    })
  }

  let mbankingChange = 0
  let cashChange = 0

  for (const tx of transactions) {
    const change = tx.type === "expense" ? Number(tx.amount) : -Number(tx.amount)
    if (tx.payment_method === "mbanking") {
      mbankingChange += change
    } else {
      cashChange += change
    }
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  const hasNegativeBalance = newMbankingBalance < 0 || newCashBalance < 0

  const transactionIds = transactions.map((tx) => tx.id)
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds)

  if (deleteError) {
    return errorResponse(deleteError.message, 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: Math.max(0, newMbankingBalance),
      cash_balance: Math.max(0, newCashBalance),
    })
    .eq("id", userId)

  if (balanceError) {
    await supabase.from("transactions").insert(transactions)
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  const periodText = payload.month && payload.year
    ? ` bulan ${payload.month}/${payload.year}`
    : ""

  const result: BatchActionResult = {
    success: true,
    totalRequested: transactions.length,
    totalSucceeded: transactions.length,
    totalFailed: 0,
    totalBalanceChange: {
      mbanking: mbankingChange,
      cash: cashChange,
    },
    results: [],
  }

  let message = `${transactions.length} transaksi${periodText} berhasil dihapus`
  if (hasNegativeBalance) {
    message += ". Saldo telah di-reset ke 0."
  }

  return NextResponse.json({
    success: true,
    message,
    result,
  })
}
