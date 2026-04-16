import { jsonResponse, errorResponse } from "@/lib/utils/api-response"
import { getChatModels } from "@/lib/config/cerebras"

export async function GET() {
  try {
    return jsonResponse({ models: getChatModels() })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Gagal memuat model Cerebras.",
      500
    )
  }
}
