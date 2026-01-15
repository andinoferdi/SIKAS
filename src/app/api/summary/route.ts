import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get("month") || String(new Date().getMonth() + 1)
  const year = searchParams.get("year") || String(new Date().getFullYear())

  const startDate = `${year}-${month.padStart(2, "0")}-01`
  const endDate = new Date(Number(year), Number(month), 0)
    .toISOString()
    .split("T")[0]

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("user_id", session.userId)
    .gte("transaction_date", startDate)
    .lte("transaction_date", endDate)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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

  return NextResponse.json({
    summary: {
      ...summary,
      net: summary.total_income - summary.total_expense,
    },
  })
}
