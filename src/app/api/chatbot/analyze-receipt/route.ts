import { NextRequest } from "next/server"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"
import {
  getOpenRouterBaseUrl,
  getOpenRouterHeaders,
  getVisionModelId,
} from "@/lib/config/openrouter"

const MAX_IMAGE_CHARS = 4_000_000

const INSTRUCTION = `Kamu membaca foto struk belanja Indonesia.
Kembalikan HANYA JSON tanpa penjelasan dan tanpa pembungkus markdown, dengan bentuk:
{"merchant":string|null,"date":"YYYY-MM-DD"|null,"total":number|null,"items":[{"name":string,"amount":number}]}
Aturan: total dan amount berupa angka rupiah tanpa titik, koma, atau simbol.
Bila sebuah nilai tidak terbaca, isi null. Bila bukan struk, isi semua null dan items kosong.`

export interface ReceiptResult {
  merchant: string | null
  date: string | null
  total: number | null
  items: { name: string; amount: number }[]
}

/* Model kadang membungkus JSON dengan pagar markdown meski sudah diminta
   tidak. Pagar itu dilepas sebelum di-parse. */
const stripFence = (text: string): string =>
  text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim()

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { image?: string }
    const image = body.image?.trim()

    if (!image) {
      return errorResponse("Foto struk belum dilampirkan.", 400)
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
              { type: "text", text: INSTRUCTION },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        max_tokens: 900,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      return errorResponse(
        response.status === 401
          ? "Autentikasi OpenRouter gagal. Periksa OPENROUTER_API_KEY di server."
          : detail || "Model gagal membaca struk.",
        response.status
      )
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const raw = json.choices?.[0]?.message?.content

    if (!raw) {
      return errorResponse("Model tidak mengembalikan hasil pembacaan struk.", 502)
    }

    let parsed: ReceiptResult
    try {
      parsed = JSON.parse(stripFence(raw)) as ReceiptResult
    } catch {
      return errorResponse(
        "Struk tidak terbaca dengan jelas. Coba foto ulang dengan cahaya lebih terang.",
        422
      )
    }

    return jsonResponse({
      receipt: {
        merchant: parsed.merchant ?? null,
        date: parsed.date ?? null,
        total: typeof parsed.total === "number" ? parsed.total : null,
        items: Array.isArray(parsed.items) ? parsed.items : [],
      },
      model: modelId,
    })
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Terjadi kesalahan server.",
      500
    )
  }
}
