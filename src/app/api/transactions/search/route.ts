import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return errorResponse("Unauthorized", 401)
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query || query.trim().length < 2) {
      return jsonResponse({ transactions: [] })
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
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ transactions: data })
  } catch (error) {
    console.error("Search error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
