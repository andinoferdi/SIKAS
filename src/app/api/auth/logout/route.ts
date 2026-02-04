import { deleteSession } from "@/lib/auth/session"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function POST() {
  try {
    await deleteSession()
    return jsonResponse({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
