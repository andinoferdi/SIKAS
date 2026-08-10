import { NextRequest, NextResponse } from "next/server"
import { errorResponse } from "@/lib/utils/api-response"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { searchUserTransactions } from "@/services/chatbot/user-context"
import { getJakartaDateString } from "@/lib/utils/format"
import { normalizePaymentMethod } from "@/services/chatbot/intent-parser"
import type {
  ChatbotAction,
  CreateTransactionPayload,
  DeleteTransactionPayload,
  EditTransactionPayload,
  SearchTransactionsPayload,
} from "@/types/rag"

const MIN_MBANKING_BALANCE = 50000

async function resolveTransactionId(
  userId: string,
  shortOrFullId: string
): Promise<string | null> {
  const supabase = await createClient()

  if (shortOrFullId.length === 36) {
    return shortOrFullId
  }

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })
    .limit(20)

  if (!transactions) return null

  const match = transactions.find((tx) => tx.id.endsWith(shortOrFullId))
  return match?.id || null
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return errorResponse("Tidak diizinkan", 401)
    }

    const body = await request.json()
    const { action, payload } = body as { action: ChatbotAction; payload: unknown }

    switch (action) {
      case "create_transaction":
        return await handleCreateTransaction(session.userId, payload as CreateTransactionPayload)

      case "delete_transaction":
        return await handleDeleteTransaction(session.userId, payload as DeleteTransactionPayload)

      case "edit_transaction":
        return await handleEditTransaction(session.userId, payload as EditTransactionPayload)

      case "search_transactions":
        return await handleSearchTransactions(session.userId, payload as SearchTransactionsPayload)

      default:
        return errorResponse("Aksi tidak dikenal", 400)
    }
  } catch (error) {
    console.error("Chatbot action error:", error)
    return errorResponse(error instanceof Error ? error.message : "Terjadi kesalahan server", 500)
  }
}

async function handleCreateTransaction(
  userId: string,
  payload: CreateTransactionPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.amount || !payload.type || !payload.category || !payload.payment_method) {
    return errorResponse("Data transaksi tidak lengkap", 400)
  }

  const paymentMethod = normalizePaymentMethod(payload.payment_method)
  if (!paymentMethod) {
    return errorResponse("Metode pembayaran tidak dikenali, gunakan Cash atau M-Banking", 400)
  }
  payload = { ...payload, payment_method: paymentMethod }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  const isMbanking = payload.payment_method === "mbanking"
  const currentBalance = isMbanking
    ? Number(user.mbanking_balance)
    : Number(user.cash_balance)

  const balanceChange = payload.type === "expense" ? -payload.amount : payload.amount
  const newBalance = currentBalance + balanceChange

  if (payload.type === "expense") {
    if (newBalance < 0) {
      return errorResponse("Saldo tidak cukup", 400)
    }

    if (isMbanking && newBalance < MIN_MBANKING_BALANCE) {
      return errorResponse(`Minimal saldo M-Banking harus Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
    }
  }

  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      description: payload.description || null,
      payment_method: payload.payment_method,
      transaction_date: payload.transaction_date || getJakartaDateString(),
    })
    .select()
    .single()

  if (txError) {
    return errorResponse(txError.message, 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
    .eq("id", userId)

  if (balanceError) {
    await supabase.from("transactions").delete().eq("id", transaction.id)
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  return NextResponse.json({
    success: true,
    message: `Transaksi ${payload.type === "income" ? "pemasukan" : "pengeluaran"} sebesar Rp ${payload.amount.toLocaleString("id-ID")} berhasil ditambahkan`,
    transaction,
  })
}

async function handleDeleteTransaction(
  userId: string,
  payload: DeleteTransactionPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.transactionId) {
    return errorResponse("ID transaksi tidak diberikan", 400)
  }

  const fullId = await resolveTransactionId(userId, payload.transactionId)
  if (!fullId) {
    return errorResponse("Transaksi tidak ditemukan", 404)
  }

  const { data: transaction, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", fullId)
    .eq("user_id", userId)
    .single()

  if (fetchError || !transaction) {
    return errorResponse("Transaksi tidak ditemukan", 404)
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  const isMbanking = transaction.payment_method === "mbanking"
  const currentBalance = isMbanking
    ? Number(user.mbanking_balance)
    : Number(user.cash_balance)

  const balanceChange = transaction.type === "expense"
    ? Number(transaction.amount)
    : -Number(transaction.amount)
  const newBalance = currentBalance + balanceChange

  if (transaction.type === "income") {
    if (newBalance < 0) {
      return errorResponse("Tidak dapat menghapus: saldo akan menjadi negatif", 400)
    }

    if (isMbanking && newBalance < MIN_MBANKING_BALANCE) {
      return errorResponse(`Tidak dapat menghapus: saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
    }
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", fullId)
    .eq("user_id", userId)

  if (deleteError) {
    return errorResponse(deleteError.message, 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
    .eq("id", userId)

  if (balanceError) {
    await supabase.from("transactions").insert(transaction)
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  return NextResponse.json({
    success: true,
    message: `Transaksi ${transaction.type === "income" ? "pemasukan" : "pengeluaran"} sebesar Rp ${Number(transaction.amount).toLocaleString("id-ID")} berhasil dihapus`,
  })
}

async function handleEditTransaction(
  userId: string,
  payload: EditTransactionPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  if (!payload.transactionId) {
    return errorResponse("ID transaksi tidak diberikan", 400)
  }

  if (!payload.updates || Object.keys(payload.updates).length === 0) {
    return errorResponse("Tidak ada data yang diubah", 400)
  }

  if (payload.updates.payment_method !== undefined) {
    const normalizedPaymentMethod = normalizePaymentMethod(payload.updates.payment_method)
    if (!normalizedPaymentMethod) {
      return errorResponse("Metode pembayaran tidak dikenali, gunakan Cash atau M-Banking", 400)
    }
    payload = { ...payload, updates: { ...payload.updates, payment_method: normalizedPaymentMethod } }
  }

  const fullId = await resolveTransactionId(userId, payload.transactionId)
  if (!fullId) {
    return errorResponse("Transaksi tidak ditemukan", 404)
  }

  const { data: existingTx, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", fullId)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingTx) {
    return errorResponse("Transaksi tidak ditemukan", 404)
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return errorResponse("User tidak ditemukan", 404)
  }

  const oldAmount = Number(existingTx.amount)
  const oldType = existingTx.type as "income" | "expense"
  const oldPaymentMethod = existingTx.payment_method as "mbanking" | "cash"

  const newAmount = payload.updates.amount ?? oldAmount
  const newType = payload.updates.type ?? oldType
  const newPaymentMethod = payload.updates.payment_method ?? oldPaymentMethod

  const oldIsMbanking = oldPaymentMethod === "mbanking"
  const oldBalanceChange = oldType === "expense" ? oldAmount : -oldAmount

  const newIsMbanking = newPaymentMethod === "mbanking"

  let newMbankingBalance = Number(user.mbanking_balance)
  let newCashBalance = Number(user.cash_balance)

  if (oldIsMbanking) {
    newMbankingBalance += oldBalanceChange
  } else {
    newCashBalance += oldBalanceChange
  }

  const newBalanceChangeAmount = newType === "expense" ? -newAmount : newAmount
  if (newIsMbanking) {
    newMbankingBalance += newBalanceChangeAmount
  } else {
    newCashBalance += newBalanceChangeAmount
  }

  if (newMbankingBalance < 0 || newCashBalance < 0) {
    return errorResponse("Saldo tidak cukup untuk perubahan ini", 400)
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return errorResponse(`Saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
  }

  const updateData: Record<string, unknown> = {}
  if (payload.updates.amount !== undefined) updateData.amount = payload.updates.amount
  if (payload.updates.type !== undefined) updateData.type = payload.updates.type
  if (payload.updates.category !== undefined) updateData.category = payload.updates.category
  if (payload.updates.description !== undefined) updateData.description = payload.updates.description
  if (payload.updates.payment_method !== undefined) updateData.payment_method = payload.updates.payment_method
  if (payload.updates.transaction_date !== undefined) updateData.transaction_date = payload.updates.transaction_date

  const { error: updateError } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", fullId)
    .eq("user_id", userId)

  if (updateError) {
    return errorResponse(updateError.message, 500)
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    await supabase
      .from("transactions")
      .update({
        amount: existingTx.amount,
        type: existingTx.type,
        category: existingTx.category,
        description: existingTx.description,
        payment_method: existingTx.payment_method,
        transaction_date: existingTx.transaction_date,
      })
      .eq("id", fullId)
    return errorResponse("Gagal memperbarui saldo", 500)
  }

  const changes: string[] = []
  if (payload.updates.amount !== undefined) changes.push(`jumlah menjadi Rp ${newAmount.toLocaleString("id-ID")}`)
  if (payload.updates.type !== undefined) changes.push(`jenis menjadi ${newType === "income" ? "pemasukan" : "pengeluaran"}`)
  if (payload.updates.category !== undefined) changes.push(`kategori menjadi ${payload.updates.category}`)
  if (payload.updates.description !== undefined) changes.push(`deskripsi menjadi "${payload.updates.description}"`)
  if (payload.updates.payment_method !== undefined) changes.push(`metode menjadi ${newPaymentMethod === "mbanking" ? "M-Banking" : "Cash"}`)
  if (payload.updates.transaction_date !== undefined) changes.push(`tanggal menjadi ${payload.updates.transaction_date}`)

  return NextResponse.json({
    success: true,
    message: `Transaksi berhasil diubah: ${changes.join(", ")}`,
  })
}

async function handleSearchTransactions(
  userId: string,
  payload: SearchTransactionsPayload
): Promise<NextResponse> {
  const transactions = await searchUserTransactions(userId, payload)

  return NextResponse.json({
    success: true,
    transactions,
    count: transactions.length,
  })
}
