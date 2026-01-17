import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { createTransactionApiSchema } from "@/lib/validations"

export async function DELETE(
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { data: transaction } = await supabase
    .from("transactions")
    .select("amount, type, payment_method")
    .eq("id", id)
    .eq("user_id", session.userId)
    .single()

  if (!transaction) {
    return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
  }

  const { data: currentUser } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", session.userId)
    .single()

  if (!currentUser) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }

  const isMbanking = transaction.payment_method === "mbanking"
  const balanceReverse = transaction.type === "expense" ? transaction.amount : -transaction.amount
  const currentBalance = isMbanking
    ? Number(currentUser.mbanking_balance)
    : Number(currentUser.cash_balance)
  const newBalance = currentBalance + balanceReverse

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  const { error: balanceError } = await supabase
    .from("users")
    .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
    .eq("id", session.userId)

  if (balanceError) {
    await supabase
      .from("transactions")
      .insert({
        id,
        user_id: session.userId,
        amount: transaction.amount,
        type: transaction.type,
        payment_method: transaction.payment_method,
      })

    return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}


const MIN_MBANKING_BALANCE = 50000

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  try {
    const body = await request.json()
    
    const validation = createTransactionApiSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { amount, type, category, description, payment_method, transaction_date } = validation.data

    const { data: oldTransaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.userId)
      .single()

    if (!oldTransaction) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 })
    }

    const { data: user } = await supabase
      .from("users")
      .select("mbanking_balance, cash_balance")
      .eq("id", session.userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    let mbankingBalance = Number(user.mbanking_balance)
    let cashBalance = Number(user.cash_balance)

    const oldIsMbanking = oldTransaction.payment_method === "mbanking"
    const oldAmount = Number(oldTransaction.amount)
    
    if (oldTransaction.type === "expense") {
      if (oldIsMbanking) {
        mbankingBalance += oldAmount
      } else {
        cashBalance += oldAmount
      }
    } else {
      if (oldIsMbanking) {
        mbankingBalance -= oldAmount
      } else {
        cashBalance -= oldAmount
      }
    }

    const newIsMbanking = payment_method === "mbanking"
    
    if (type === "expense") {
      if (newIsMbanking) {
        mbankingBalance -= amount
      } else {
        cashBalance -= amount
      }
    } else {
      if (newIsMbanking) {
        mbankingBalance += amount
      } else {
        cashBalance += amount
      }
    }

    if (cashBalance < 0) {
      return NextResponse.json(
        { error: "Saldo Cash tidak cukup untuk perubahan ini" },
        { status: 400 }
      )
    }

    if (mbankingBalance < MIN_MBANKING_BALANCE) {
      return NextResponse.json(
        { error: `Saldo M-Banking minimal harus Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
        { status: 400 }
      )
    }

    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update({
        amount,
        type,
        category,
        description: description || null,
        payment_method,
        transaction_date,
      })
      .eq("id", id)
      .eq("user_id", session.userId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    const { error: balanceError } = await supabase
      .from("users")
      .update({
        mbanking_balance: mbankingBalance,
        cash_balance: cashBalance,
      })
      .eq("id", session.userId)

    if (balanceError) {
      await supabase
        .from("transactions")
        .update({
          amount: oldTransaction.amount,
          type: oldTransaction.type,
          category: oldTransaction.category,
          description: oldTransaction.description,
          payment_method: oldTransaction.payment_method,
          transaction_date: oldTransaction.transaction_date,
        })
        .eq("id", id)
        .eq("user_id", session.userId)

      return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
    }

    return NextResponse.json({ transaction: updatedTransaction })
  } catch (error) {
    console.error("Update transaction error:", error)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
