import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { getJakartaDateString } from "@/lib/utils/format"
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
        return NextResponse.json({ error: "Unknown batch action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Batch action error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

async function handleBatchCreate(
  userId: string,
  payload: BatchCreateTransactionsPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.transactions || !Array.isArray(payload.transactions)) {
    return NextResponse.json({ error: "Data transaksi tidak valid" }, { status: 400 })
  }

  if (payload.transactions.length === 0) {
    return NextResponse.json({ error: "Tidak ada transaksi untuk ditambahkan" }, { status: 400 })
  }

  if (payload.transactions.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_BATCH_SIZE} transaksi per batch` },
      { status: 400 }
    )
  }

  // Validate all transactions first
  for (let i = 0; i < payload.transactions.length; i++) {
    const tx = payload.transactions[i]
    if (!tx.amount || !tx.type || !tx.category || !tx.payment_method) {
      return NextResponse.json(
        { error: `Transaksi #${i + 1} tidak lengkap` },
        { status: 400 }
      )
    }
  }

  // Get current user balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // Calculate total balance changes
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

  // Validate final balances
  if (newCashBalance < 0) {
    return NextResponse.json(
      { error: `Saldo Cash tidak cukup. Perubahan total: Rp ${Math.abs(cashChange).toLocaleString("id-ID")}` },
      { status: 400 }
    )
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return NextResponse.json(
      { error: `Saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
      { status: 400 }
    )
  }

  // Prepare transactions for insert
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

  // Insert all transactions
  const { data: insertedTransactions, error: insertError } = await supabase
    .from("transactions")
    .insert(transactionsToInsert)
    .select()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Update user balance
  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    // Rollback: delete inserted transactions
    const insertedIds = insertedTransactions?.map((tx) => tx.id) || []
    if (insertedIds.length > 0) {
      await supabase.from("transactions").delete().in("id", insertedIds)
    }
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
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
    return NextResponse.json(
      { error: "Filter tidak valid. Harap tentukan minimal 1 kriteria filter." },
      { status: 400 }
    )
  }

  // Build query to find matching transactions
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
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
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
    return NextResponse.json(
      { error: `Terlalu banyak transaksi (${transactions.length}). Maksimal ${MAX_BATCH_SIZE} transaksi per batch. Persempit filter.` },
      { status: 400 }
    )
  }

  // Get current user balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // Calculate balance changes (reverse of the transactions)
  let mbankingChange = 0
  let cashChange = 0

  for (const tx of transactions) {
    // Deleting expense = add back, deleting income = subtract
    const change = tx.type === "expense" ? Number(tx.amount) : -Number(tx.amount)
    if (tx.payment_method === "mbanking") {
      mbankingChange += change
    } else {
      cashChange += change
    }
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  // Validate final balances
  if (newCashBalance < 0) {
    return NextResponse.json(
      { error: "Tidak dapat menghapus: saldo Cash akan menjadi negatif" },
      { status: 400 }
    )
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return NextResponse.json(
      { error: `Tidak dapat menghapus: saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
      { status: 400 }
    )
  }

  // Delete all matching transactions
  const transactionIds = transactions.map((tx) => tx.id)
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Update user balance
  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    // Rollback: re-insert deleted transactions
    await supabase.from("transactions").insert(transactions)
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
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
    return NextResponse.json({ error: "Data update tidak valid" }, { status: 400 })
  }

  if (payload.updates.length === 0) {
    return NextResponse.json({ error: "Tidak ada transaksi untuk diubah" }, { status: 400 })
  }

  if (payload.updates.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Maksimal ${MAX_BATCH_SIZE} transaksi per batch edit` },
      { status: 400 }
    )
  }

  // Validate all updates have transactionId
  for (let i = 0; i < payload.updates.length; i++) {
    const update = payload.updates[i]
    if (!update.transactionId) {
      return NextResponse.json(
        { error: `Update #${i + 1} tidak memiliki transactionId` },
        { status: 400 }
      )
    }
    if (!update.updates || Object.keys(update.updates).length === 0) {
      return NextResponse.json(
        { error: `Update #${i + 1} tidak memiliki perubahan` },
        { status: 400 }
      )
    }
  }

  // Get all transaction IDs to fetch
  const transactionIds = payload.updates.map((u) => u.transactionId)

  // Fetch all existing transactions
  const { data: existingTransactions, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .in("id", transactionIds)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!existingTransactions || existingTransactions.length !== transactionIds.length) {
    const foundIds = new Set(existingTransactions?.map((tx) => tx.id) || [])
    const missingIds = transactionIds.filter((id) => !foundIds.has(id))
    return NextResponse.json(
      { error: `Transaksi tidak ditemukan: ${missingIds.length} transaksi tidak valid atau bukan milik user` },
      { status: 404 }
    )
  }

  // Get current user balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // Calculate balance changes for each edit
  // For each edit: reverse old transaction, apply new values
  let mbankingChange = 0
  let cashChange = 0

  const transactionMap = new Map(existingTransactions.map((tx) => [tx.id, tx]))

  for (const update of payload.updates) {
    const oldTx = transactionMap.get(update.transactionId)!
    const newUpdates = update.updates

    // Determine old and new values
    const oldAmount = Number(oldTx.amount)
    const oldType = oldTx.type as "income" | "expense"
    const oldPaymentMethod = oldTx.payment_method as "mbanking" | "cash"

    const newAmount = newUpdates.amount ?? oldAmount
    const newType = newUpdates.type ?? oldType
    const newPaymentMethod = newUpdates.payment_method ?? oldPaymentMethod

    // Reverse old transaction
    const oldChange = oldType === "expense" ? oldAmount : -oldAmount
    if (oldPaymentMethod === "mbanking") {
      mbankingChange += oldChange
    } else {
      cashChange += oldChange
    }

    // Apply new transaction
    const newChange = newType === "expense" ? -newAmount : newAmount
    if (newPaymentMethod === "mbanking") {
      mbankingChange += newChange
    } else {
      cashChange += newChange
    }
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  // Validate final balances
  if (newCashBalance < 0) {
    return NextResponse.json(
      { error: "Tidak dapat mengubah: saldo Cash akan menjadi negatif" },
      { status: 400 }
    )
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return NextResponse.json(
      { error: `Tidak dapat mengubah: saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
      { status: 400 }
    )
  }

  // Store original transactions for potential rollback
  const originalTransactions = [...existingTransactions]

  // Update all transactions
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
    // All failed, no need to update balance
    return NextResponse.json(
      { error: "Semua update gagal", details: updateResults },
      { status: 500 }
    )
  }

  // Update user balance
  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    // Rollback: restore original transactions
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
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
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

  // Validate confirmation text
  if (payload.confirmationText !== "HAPUS SEMUA") {
    return NextResponse.json(
      { error: "Konfirmasi tidak valid. Ketik 'HAPUS SEMUA' untuk melanjutkan." },
      { status: 400 }
    )
  }

  // Build query based on optional month/year filter
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
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
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

  // Calculate balance changes
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

  // Get current balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  const newMbankingBalance = Number(user.mbanking_balance) + mbankingChange
  const newCashBalance = Number(user.cash_balance) + cashChange

  // For delete all, we allow negative balances since user explicitly wants to reset
  // But we'll warn if the balance would be unusual
  const hasNegativeBalance = newMbankingBalance < 0 || newCashBalance < 0

  // Delete all matching transactions
  const transactionIds = transactions.map((tx) => tx.id)
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .in("id", transactionIds)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Update user balance
  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: Math.max(0, newMbankingBalance),
      cash_balance: Math.max(0, newCashBalance),
    })
    .eq("id", userId)

  if (balanceError) {
    // Rollback: re-insert deleted transactions
    await supabase.from("transactions").insert(transactions)
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
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
