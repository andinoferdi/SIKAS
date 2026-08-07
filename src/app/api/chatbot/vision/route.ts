import { NextRequest } from "next/server"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"
import {
  getOpenRouterBaseUrl,
  getOpenRouterHeaders,
  getVisionModelId,
} from "@/lib/config/openrouter"

/* Batas ukuran gambar. Data URL base64 membesar sekitar 33 persen dari
   berkas aslinya, jadi 4 MB payload kira-kira setara 3 MB gambar. */
const MAX_IMAGE_CHARS = 4_000_000

interface VisionBody {
  image?: string
  prompt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VisionBody
    const image = body.image?.trim()

    if (!image) {
      return errorResponse("Gambar belum dilampirkan.", 400)
    }

    if (!image.startsWith("data:image/")) {
      return errorResponse("Format gambar tidak dikenali.", 400)
    }

    if (image.length > MAX_IMAGE_CHARS) {
      return errorResponse("Ukuran gambar terlalu besar. Maksimal sekitar 3 MB.", 413)
    }

    const modelId = await getVisionModelId()

    const response = await fetch(`${getOpenRouterBaseUrl()}/chat/completions`, {
      method: "POST",
      headers: getOpenRouterHeaders(),
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  body.prompt?.trim() ||
                  "Jelaskan isi gambar ini secara ringkas dalam bahasa Indonesia. Bila gambar berisi nominal uang, sebutkan angkanya.",
              },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 700,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return errorResponse(
        response.status === 401
          ? "Autentikasi OpenRouter gagal. Periksa OPENROUTER_API_KEY di server."
          : detail || "Model gagal membaca gambar.",
        response.status
      )
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = json.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return errorResponse("Model tidak mengembalikan hasil analisis.", 502)
    }

    return jsonResponse({ result: content, model: modelId })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Terjadi kesalahan server.",
      500
    )
  }
}
