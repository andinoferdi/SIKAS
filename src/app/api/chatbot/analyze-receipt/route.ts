import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"
import { getJakartaDateString } from "@/lib/utils/format"

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "SIKAS"

const VISION_MODELS = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen2.5-vl-7b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
]



const ANALYSIS_PROMPT = `Analisis gambar nota/struk ini dan ekstrak informasi berikut dalam format JSON:
{
  "amount": <total_amount_number>,
  "description": "<merchant_name_or_items>",
  "category": "<kategori>",
  "date": "<YYYY-MM-DD_if_visible_or_null>"
}

Kategori yang tersedia: Makan, Transport, Belanja, Tagihan, Lainnya

Aturan:
- amount: Angka total pembayaran tanpa titik/koma (contoh: 50000, bukan "50.000")
- description: Nama toko atau item utama yang dibeli (singkat)
- category: Pilih kategori paling sesuai dari daftar
- date: Format YYYY-MM-DD jika terlihat di struk, null jika tidak ada

Jika gambar bukan nota/struk atau tidak bisa dibaca, kembalikan:
{"error": "Gambar tidak dapat dianalisis sebagai nota/struk"}

PENTING: Hanya kembalikan JSON, tanpa penjelasan tambahan.`

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

    if (!image) {
      return NextResponse.json({ error: "Tidak ada gambar" }, { status: 400 })
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

    let analysisResult = null
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
                  role: "user",
                  content: [
                    { type: "text", text: ANALYSIS_PROMPT },
                    {
                      type: "image_url",
                      image_url: { url: `data:${mimeType};base64,${base64}` },
                    },
                  ],
                },
              ],
              temperature: 0.3,
              max_tokens: 500,
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
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            analysisResult = JSON.parse(jsonMatch[0])
            break
          }
        }
      } catch (error) {
        console.warn(`Vision model ${model} error:`, error)
        lastError = error instanceof Error ? error : new Error(String(error))
        continue
      }
    }

    if (!analysisResult) {
      return NextResponse.json(
        {
          error: lastError?.message || "Gagal menganalisis gambar dengan semua model",
        },
        { status: 500 }
      )
    }

    if (analysisResult.error) {
      return NextResponse.json(
        { error: analysisResult.error },
        { status: 400 }
      )
    }

    if (!analysisResult.amount || typeof analysisResult.amount !== "number") {
      return NextResponse.json(
        { error: "Tidak dapat mendeteksi jumlah pembayaran dari nota" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("cash_balance")
      .eq("id", session.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
    }

    const currentBalance = Number(user.cash_balance)
    const newBalance = currentBalance - analysisResult.amount

    if (newBalance < 0) {
      return NextResponse.json(
        {
          error: `Saldo Cash tidak cukup. Saldo: Rp ${currentBalance.toLocaleString("id-ID")}, Dibutuhkan: Rp ${analysisResult.amount.toLocaleString("id-ID")}`,
          analysis: analysisResult,
        },
        { status: 400 }
      )
    }

    const today = getJakartaDateString()
    const transactionDate = analysisResult.date || today

    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .insert({
        user_id: session.userId,
        amount: analysisResult.amount,
        type: "expense",
        category: analysisResult.category || "Lainnya",
        description: analysisResult.description || "Dari scan nota",
        payment_method: "cash",
        transaction_date: transactionDate,
      })
      .select()
      .single()

    if (txError) {
      return NextResponse.json(
        { error: txError.message, analysis: analysisResult },
        { status: 500 }
      )
    }

    const { error: balanceError } = await supabase
      .from("users")
      .update({ cash_balance: newBalance })
      .eq("id", session.userId)

    if (balanceError) {
      await supabase.from("transactions").delete().eq("id", transaction.id)
      return NextResponse.json(
        { error: "Gagal memperbarui saldo" },
        { status: 500 }
      )
    }

    const formatAmount = (n: number) => `Rp ${n.toLocaleString("id-ID")}`

    return NextResponse.json({
      success: true,
      message: `Nota berhasil dianalisis dan dicatat sebagai pengeluaran ${formatAmount(analysisResult.amount)} untuk kategori ${analysisResult.category || "Lainnya"}${analysisResult.description ? ` (${analysisResult.description})` : ""}.`,
      transaction,
      analysis: analysisResult,
    })
  } catch (error) {
    console.error("Receipt analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
