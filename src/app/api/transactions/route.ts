import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get("month")
  const year = searchParams.get("year")
  const limit = searchParams.get("limit")

  const supabase = await createClient()

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.userId)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })

  if (month && year) {
    const startDate = `${year}-${month.padStart(2, "0")}-01`
    const endDate = new Date(Number(year), Number(month), 0)
      .toISOString()
      .split("T")[0]
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate)
  }

  if (limit) {
    query = query.limit(Number(limit))
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ transactions: data })
}

const MIN_MBANKING_BALANCE = 50000

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { amount, type, category, description, payment_method, transaction_date } = body

    if (!amount || !type || !category || !payment_method || !transaction_date) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      )
    }

    const transactionAmount = Number(amount)
    const supabase = await createClient()

    // Fetch current balances first
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("mbanking_balance, cash_balance")
      .eq("id", session.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const isMbanking = payment_method === "mbanking"
    const currentBalance = isMbanking
      ? Number(user.mbanking_balance)
      : Number(user.cash_balance)

    // Calculate new balance
    const balanceChange = type === "expense" ? -transactionAmount : transactionAmount
    const newBalance = currentBalance + balanceChange

    // Validate balance
    if (type === "expense") {
      if (newBalance < 0) {
        return NextResponse.json(
          { error: "Saldo tidak cukup" },
          { status: 400 }
        )
      }

      if (isMbanking && newBalance < MIN_MBANKING_BALANCE) {
        return NextResponse.json(
          { error: `Minimal saldo M-Banking harus Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}` },
          { status: 400 }
        )
      }
    }

    // Insert transaction
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: session.userId,
        amount: transactionAmount,
        type,
        category,
        description: description || null,
        payment_method,
        transaction_date,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from("users")
      .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
      .eq("id", session.userId)

    if (balanceError) {
      // Rollback: delete the transaction we just created
      await supabase
        .from("transactions")
        .delete()
        .eq("id", data.id)

      return NextResponse.json({ error: "Gagal memperbarui saldo" }, { status: 500 })
    }

    return NextResponse.json({ transaction: data })
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

