import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "SIKAS"

const VISION_MODELS = [
  "google/gemma-3-27b-it:free",
  "google/gemma-3-4b-it:free",
  "allenai/molmo-2-8b:free",
]

const SYSTEM_PROMPT = `Kamu adalah asisten AI yang bisa menganalisis gambar untuk pengguna SIKAS.

PENTING - TENTANG SUMBER GAMBAR:
- Gambar yang dikirim pengguna bisa dari MANA SAJA (aplikasi banking, e-wallet, struk toko, dokumen, dll)
- JANGAN pernah mengklaim gambar berasal dari "aplikasi SIKAS" kecuali ada bukti jelas (logo SIKAS, UI SIKAS)
- Fokus pada KONTEN gambar, bukan asumsi tentang sumbernya
- Jika gambar adalah screenshot transaksi dari aplikasi lain (BRI, BCA, GoPay, OVO, dll), sebutkan dengan benar

Kemampuanmu meliputi:
- Mendeskripsikan isi gambar secara objektif
- Membaca teks dalam gambar (OCR)
- Menganalisis dokumen, nota, struk, invoice
- Mengidentifikasi objek, orang, tempat
- Menjawab pertanyaan spesifik tentang gambar
- Mengekstrak informasi transaksi (jumlah, tanggal, tujuan, dll)

Jawab dalam Bahasa Indonesia yang ramah dan informatif.
Jika gambar tidak jelas atau tidak bisa dianalisis, jelaskan dengan sopan.`

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key tidak dikonfigurasi" },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const image = formData.get("image") as File
    const prompt = formData.get("prompt") as string

    if (!image) {
      return NextResponse.json({ error: "Tidak ada gambar" }, { status: 400 })
    }

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Instruksi atau pertanyaan wajib diisi" },
        { status: 400 }
      )
    }

    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File harus berupa gambar" },
        { status: 400 }
      )
    }

    if (image.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Ukuran gambar maksimal 10MB" },
        { status: 400 }
      )
    }

    const buffer = await image.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const mimeType = image.type

    type VisionErrorType = "rate_limit" | "model_unavailable" | "quota_exceeded" | "auth_error" | "unknown"

    interface ModelError {
      model: string
      type: VisionErrorType
      statusCode?: number
      message: string
    }

    let responseContent = null
    const modelErrors: ModelError[] = []

    for (const model of VISION_MODELS) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${API_KEY}`,
              "HTTP-Referer": SITE_URL,
              "X-Title": SITE_NAME,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [
                {
                  role: "system",
                  content: SYSTEM_PROMPT,
                },
                {
                  role: "user",
                  content: [
                    { type: "text", text: prompt },
                    {
                      type: "image_url",
                      image_url: { url: `data:${mimeType};base64,${base64}` },
                    },
                  ],
                },
              ],
              temperature: 0.7,
              max_tokens: 1000,
            }),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          let errorType: VisionErrorType = "unknown"

          try {
            const errorData = JSON.parse(errorText)
            const code = errorData?.error?.code || response.status
            const msg = (errorData?.error?.message || "").toLowerCase()

            if (code === 429) errorType = "rate_limit"
            else if (code === 402) errorType = "quota_exceeded"
            else if (code === 401) errorType = "auth_error"
            else if (code === 404 || msg.includes("not found") || msg.includes("no endpoints")) {
              errorType = "model_unavailable"
            }
          } catch {
            if (response.status === 429) errorType = "rate_limit"
            else if (response.status === 404) errorType = "model_unavailable"
          }

          modelErrors.push({
            model,
            type: errorType,
            statusCode: response.status,
            message: errorText.slice(0, 200)
          })
          console.warn(`Vision ${model}:`, { type: errorType, status: response.status })
          continue
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (content) {
          responseContent = content
          break
        }
      } catch (error) {
        modelErrors.push({
          model,
          type: "unknown",
          message: String(error).slice(0, 200)
        })
        console.warn(`Vision model ${model} error:`, error)
        continue
      }
    }

    if (!responseContent) {
      const allRateLimited = modelErrors.length > 0 && modelErrors.every(e => e.type === "rate_limit")
      const allUnavailable = modelErrors.length > 0 && modelErrors.every(e => e.type === "model_unavailable")
      const anyQuotaExceeded = modelErrors.some(e => e.type === "quota_exceeded")
      const anyAuthError = modelErrors.some(e => e.type === "auth_error")

      let errorMessage: string

      if (anyAuthError) {
        errorMessage = "Terjadi masalah autentikasi API. Silakan hubungi administrator."
      } else if (anyQuotaExceeded) {
        errorMessage = "Kuota API bulanan telah habis. Fitur analisis gambar tidak tersedia sampai kuota direset."
      } else if (allRateLimited) {
        errorMessage = "Terlalu banyak permintaan. Chat teks biasa tetap bisa digunakan. Coba lagi dalam beberapa menit."
      } else if (allUnavailable) {
        errorMessage = "Model vision sedang tidak tersedia atau dalam maintenance. Coba lagi nanti."
      } else {
        errorMessage = "Gagal menganalisis gambar. Silakan coba lagi."
      }

      console.error("Vision failed - all models:", modelErrors.map(e => ({ model: e.model, type: e.type, status: e.statusCode })))

      const isDev = process.env.NODE_ENV === "development"

      return NextResponse.json(
        {
          error: errorMessage,
          ...(isDev && { debug: modelErrors.map(e => ({ model: e.model, type: e.type, status: e.statusCode, message: e.message })) })
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: responseContent,
    })
  } catch (error) {
    console.error("Vision analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
