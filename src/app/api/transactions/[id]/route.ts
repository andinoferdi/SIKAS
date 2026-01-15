import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function DELETE(
  request: NextRequest,
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

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", session.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const balanceReverse = transaction.type === "expense" ? transaction.amount : -transaction.amount

  const { data: currentUser } = await supabase
    .from("users")
    .select("mbanking_balance, cash_balance")
    .eq("id", session.userId)
    .single()

  if (currentUser) {
    const isMbanking = transaction.payment_method === "mbanking"
    const currentBalance = isMbanking
      ? Number(currentUser.mbanking_balance)
      : Number(currentUser.cash_balance)
    const newBalance = currentBalance + balanceReverse

    await supabase
      .from("users")
      .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
      .eq("id", session.userId)
  }

  return NextResponse.json({ success: true })
}
