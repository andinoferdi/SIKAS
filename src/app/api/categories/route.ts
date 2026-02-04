import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return errorResponse("Unauthorized", 401)
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get("type")

    const supabase = await createClient()

    let query = supabase.from("categories").select("*").order("name")

    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      return errorResponse(error.message, 500)
    }

    return jsonResponse({ categories: data })
  } catch (error) {
    console.error("Categories error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
