import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ transactions: [] })
  }

  const supabase = await createClient()
  const searchTerm = `%${query.trim()}%`

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", session.userId)
    .or(`category.ilike.${searchTerm},description.ilike.${searchTerm}`)
    .order("transaction_date", { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ transactions: data })
}
