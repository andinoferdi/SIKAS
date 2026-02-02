import { deleteSession } from "@/lib/auth/session"
import { jsonResponse } from "@/lib/utils/api-response"

export async function POST() {
  await deleteSession()
  return jsonResponse({ success: true })
}
