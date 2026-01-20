import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "SIKAS"

const VISION_MODELS = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen2.5-vl-7b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
]

const SYSTEM_PROMPT = `Kamu adalah SIKAS Bot, asisten AI yang bisa menganalisis gambar.
Kamu membantu pengguna dengan berbagai pertanyaan tentang gambar yang mereka kirimkan.

Kemampuanmu meliputi:
- Mendeskripsikan isi gambar
- Membaca teks dalam gambar (OCR)
- Menganalisis dokumen, nota, struk, invoice
- Mengidentifikasi objek, orang, tempat
- Menjawab pertanyaan spesifik tentang gambar
- Memberikan insight dari visual data

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

    let responseContent = null
    let lastError = null

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
          console.warn(`Vision model ${model} failed:`, errorText)
          lastError = new Error(errorText)
          continue
        }

        const data = await response.json()
        const content = data.choices?.[0]?.message?.content

        if (content) {
          responseContent = content
          break
        }
      } catch (error) {
        console.warn(`Vision model ${model} error:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        continue
      }
    }

    if (!responseContent) {
      let errorMessage = "Gagal menganalisis gambar. Semua model vision sedang tidak tersedia."
      let isRateLimited = false
      
      if (lastError?.message) {
        try {
          const errorData = JSON.parse(lastError.message)
          if (errorData?.error?.message) {
            if (errorData.error.code === 429) {
              isRateLimited = true
            } else if (errorData.error.message.includes("No endpoints found")) {
              isRateLimited = true
            }
          }
        } catch {
          if (lastError.message.includes("rate limit") || lastError.message.includes("Rate limit")) {
            isRateLimited = true
          }
        }
      }

      if (isRateLimited) {
        errorMessage = "Fitur analisis gambar AI sedang mencapai batas penggunaan gratis. Chat teks biasa tetap bisa digunakan. Coba lagi dalam beberapa menit."
      }
      
      return NextResponse.json(
        { error: errorMessage },
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
