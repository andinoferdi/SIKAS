import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { getJakartaDateTime, getLastDayOfMonth } from "@/lib/utils/format"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return errorResponse("Unauthorized", 401)
  }

  const searchParams = request.nextUrl.searchParams
  const jakartaTime = getJakartaDateTime()
  const month = searchParams.get("month") || String(jakartaTime.month)
  const year = searchParams.get("year") || String(jakartaTime.year)

  const startDate = `${year}-${month.padStart(2, "0")}-01`
  const endDate = getLastDayOfMonth(Number(year), Number(month))

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", session.userId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)

  if (error) {
    return errorResponse(error.message, 500)
  }

  const summary = data.reduce(
    (acc, transaction) => {
      if (transaction.type === "income") {
        acc.total_income += Number(transaction.amount)
      } else {
        acc.total_expense += Number(transaction.amount)
      }
      return acc
    },
    { total_income: 0, total_expense: 0 }
  )

  return jsonResponse({
    summary: {
      ...summary,
      net: summary.total_income - summary.total_expense,
    },
  })
}
