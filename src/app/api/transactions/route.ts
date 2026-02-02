import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { createTransactionApiSchema } from "@/lib/validations"
import { getLastDayOfMonth } from "@/lib/utils/format"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return errorResponse("Unauthorized", 401)
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
    const endDate = getLastDayOfMonth(Number(year), Number(month))
    query = query.gte("transaction_date", startDate).lte("transaction_date", endDate)
  }

  if (limit) {
    query = query.limit(Number(limit))
  }

  const { data, error } = await query

  if (error) {
    return errorResponse(error.message, 500)
  }

  return jsonResponse({ transactions: data })
}

const MIN_MBANKING_BALANCE = 50000

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return errorResponse("Unauthorized", 401)
  }

  try {
    const body = await request.json()

    const validation = createTransactionApiSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return errorResponse(firstError.message, 400)
    }

    const { amount, type, category, description, payment_method, transaction_date } = validation.data
    const supabase = await createClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("mbanking_balance, cash_balance")
      .eq("id", session.userId)
      .single()

    if (userError || !user) {
      return errorResponse("User tidak ditemukan", 404)
    }

    const isMbanking = payment_method === "mbanking"
    const currentBalance = isMbanking
      ? Number(user.mbanking_balance)
      : Number(user.cash_balance)

    const balanceChange = type === "expense" ? -amount : amount
    const newBalance = currentBalance + balanceChange

    if (type === "expense") {
      if (newBalance < 0) {
        return errorResponse("Saldo tidak cukup", 400)
      }

      if (isMbanking && newBalance < MIN_MBANKING_BALANCE) {
        return errorResponse(`Minimal saldo M-Banking harus Rp ${MIN_MBANKING_BALANCE.toLocaleString("id-ID")}`, 400)
      }
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: session.userId,
        amount,
        type,
        category,
        description: description || null,
        payment_method,
        transaction_date,
      })
      .select()
      .single()

    if (error) {
      return errorResponse(error.message, 500)
    }

    const { error: balanceError } = await supabase
      .from("users")
      .update(isMbanking ? { mbanking_balance: newBalance } : { cash_balance: newBalance })
      .eq("id", session.userId)

    if (balanceError) {
      await supabase
        .from("transactions")
        .delete()
        .eq("id", data.id)

      return errorResponse("Gagal memperbarui saldo", 500)
    }

    return jsonResponse({ transaction: data })
  } catch (error) {
    console.error("Transaction error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
