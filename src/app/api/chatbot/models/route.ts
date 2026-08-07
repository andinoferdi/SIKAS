import { jsonResponse, errorResponse } from "@/lib/utils/api-response"
import { getChatModels } from "@/lib/config/openrouter"

export async function GET() {
  try {
    return jsonResponse({ models: await getChatModels() })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Gagal memuat daftar model.",
      500
    )
  }
}
