import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return errorResponse("Tidak ada session", 401)
  }

  try {
    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, mbanking_balance, cash_balance")
      .eq("id", session.userId)
      .single()

    if (error || !user) {
      return errorResponse("User tidak ditemukan", 404)
    }

    return jsonResponse({ user })
  } catch (error) {
    console.error("Auth me error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
