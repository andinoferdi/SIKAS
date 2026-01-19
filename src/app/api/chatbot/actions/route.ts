import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { searchUserTransactions } from "@/services/chatbot/user-context"
import type {
  ChatbotAction,
  CreateTransactionPayload,
  DeleteTransactionPayload,
  EditTransactionPayload,
  SearchTransactionsPayload,
} from "@/types/rag"

const MIN_MBANKING_BALANCE = 50000

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Chatbot action error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

async function handleCreateTransaction(
  userId: string,
  payload: CreateTransactionPayload
): Promise<NextResponse> {
  const supabase = await createClient()

  // Validate required fields
  if (!payload.amount || !payload.type || !payload.category || !payload.payment_method) {
    return NextResponse.json(
      { error: "Data transaksi tidak lengkap" },
      { status: 400 }
    )
  }

  // Get user balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  const isMbanking = payload.payment_method === "mbanking"
  const currentBalance = isMbanking
    ? Number(user.mbanking_balance)
    : Number(user.cash_balance)

  const balanceChange = payload.type === "expense" ? -payload.amount : payload.amount
  const newBalance = currentBalance + balanceChange

  // Validate balance for expenses
  if (payload.type === "expense") {
    if (newBalance < 0) {
      return NextResponse.json({ error: "Saldo tidak cukup" }, { status: 400 })
    }

    if (isMbanking && newBalance < MIN_MBANKING_BALANCE) {
      return NextResponse.json(
        { error: `Minimal saldo M-Banking harus Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
        { status: 400 }
      )
    }
  }

  // Create transaction
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      amount: payload.amount,
      type: payload.type,
      category: payload.category,
      description: payload.description || null,
      payment_method: payload.payment_method,
      transaction_date: payload.transaction_date || new Date().toISOString().split("T")[0],
    })
    .select()
    .single()

  if (txError) {
    return NextResponse.json({ error: txError.message }, { status: 500 })
  }

  // Update user balance
  const { error: balanceError } = await supabase
    .from("users")
    .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
    .eq("id", userId)

  if (balanceError) {
    // Rollback transaction if balance update fails
    await supabase.from("transactions").delete().eq("id", transaction.id)
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
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
    return NextResponse.json({ error: "ID transaksi tidak diberikan" }, { status: 400 })
  }

  // Get the transaction first
  const { data: transaction, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", payload.transactionId)
    .eq("user_id", userId)
    .single()

  if (fetchError || !transaction) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
  }

  // Get user balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // Calculate balance reversal
  const isMbanking = transaction.payment_method === "mbanking"
  const currentBalance = isMbanking
    ? Number(user.mbanking_balance)
    : Number(user.cash_balance)

  // Reverse the balance change
  const balanceChange = transaction.type === "expense"
    ? Number(transaction.amount)
    : -Number(transaction.amount)
  const newBalance = currentBalance + balanceChange

  // Validate that reversal won't cause negative balance or below minimum for mbanking
  if (transaction.type === "income") {
    if (newBalance < 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus: saldo akan menjadi negatif" },
        { status: 400 }
      )
    }

    if (isMbanking && newBalance < MIN_MBANKING_BALANCE) {
      return NextResponse.json(
        { error: `Tidak dapat menghapus: saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
        { status: 400 }
      )
    }
  }

  // Delete the transaction
  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", payload.transactionId)
    .eq("user_id", userId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Update the balance
  const { error: balanceError } = await supabase
    .from("users")
    .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
    .eq("id", userId)

  if (balanceError) {
    // Try to restore the transaction (best effort)
    await supabase.from("transactions").insert(transaction)
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
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
    return NextResponse.json({ error: "ID transaksi tidak diberikan" }, { status: 400 })
  }

  if (!payload.updates || Object.keys(payload.updates).length === 0) {
    return NextResponse.json({ error: "Tidak ada data yang diubah" }, { status: 400 })
  }

  // Get the existing transaction
  const { data: existingTx, error: fetchError } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", payload.transactionId)
    .eq("user_id", userId)
    .single()

  if (fetchError || !existingTx) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
  }

  // Get user balances
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  // Determine old and new values
  const oldAmount = Number(existingTx.amount)
  const oldType = existingTx.type as "income" | "expense"
  const oldPaymentMethod = existingTx.payment_method as "mbanking" | "cash"

  const newAmount = payload.updates.amount ?? oldAmount
  const newType = payload.updates.type ?? oldType
  const newPaymentMethod = payload.updates.payment_method ?? oldPaymentMethod

  // Calculate balance changes
  // First, reverse the old transaction
  const oldIsMbanking = oldPaymentMethod === "mbanking"
  const oldBalanceKey = oldIsMbanking ? "mbanking_balance" : "cash_balance"
  let oldBalance = Number(user[oldBalanceKey])
  const oldBalanceChange = oldType === "expense" ? oldAmount : -oldAmount
  oldBalance += oldBalanceChange

  // Then, apply the new transaction
  const newIsMbanking = newPaymentMethod === "mbanking"
  const newBalanceKey = newIsMbanking ? "mbanking_balance" : "cash_balance"

  // If payment method changed, we need to handle both balances
  let newMbankingBalance = Number(user.mbanking_balance)
  let newCashBalance = Number(user.cash_balance)

  // Reverse old
  if (oldIsMbanking) {
    newMbankingBalance += oldBalanceChange
  } else {
    newCashBalance += oldBalanceChange
  }

  // Apply new
  const newBalanceChangeAmount = newType === "expense" ? -newAmount : newAmount
  if (newIsMbanking) {
    newMbankingBalance += newBalanceChangeAmount
  } else {
    newCashBalance += newBalanceChangeAmount
  }

  // Validate new balances
  if (newMbankingBalance < 0 || newCashBalance < 0) {
    return NextResponse.json({ error: "Saldo tidak cukup untuk perubahan ini" }, { status: 400 })
  }

  if (newMbankingBalance < MIN_MBANKING_BALANCE) {
    return NextResponse.json(
      { error: `Saldo M-Banking akan di bawah minimum Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
      { status: 400 }
    )
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {}
  if (payload.updates.amount !== undefined) updateData.amount = payload.updates.amount
  if (payload.updates.type !== undefined) updateData.type = payload.updates.type
  if (payload.updates.category !== undefined) updateData.category = payload.updates.category
  if (payload.updates.description !== undefined) updateData.description = payload.updates.description
  if (payload.updates.payment_method !== undefined) updateData.payment_method = payload.updates.payment_method
  if (payload.updates.transaction_date !== undefined) updateData.transaction_date = payload.updates.transaction_date

  // Update the transaction
  const { error: updateError } = await supabase
    .from("transactions")
    .update(updateData)
    .eq("id", payload.transactionId)
    .eq("user_id", userId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Update user balances
  const { error: balanceError } = await supabase
    .from("users")
    .update({
      mbanking_balance: newMbankingBalance,
      cash_balance: newCashBalance,
    })
    .eq("id", userId)

  if (balanceError) {
    // Try to rollback transaction update
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
      .eq("id", payload.transactionId)
    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
  }

  // Build change description
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
