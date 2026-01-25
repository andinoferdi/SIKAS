import { type Message, type StreamChunk, type QuickReply } from "@/types/chatbot"
import type { RAGContext, EnhancedRAGContext } from "@/types/rag"
import { pruneConversationHistory, estimateMessagesTokens } from "./token-utils"
import { getJakartaDateString } from "@/lib/utils/format"

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "SIKAS"

import type { AIModel } from "@/types/chatbot"

export const MODELS = [
  "mistralai/devstral-2512:free",
  "nvidia/nemotron-3-nano-30b-a3b:free",
  "xiaomi/mimo-v2-flash:free",
  "arcee-ai/trinity-mini:free",
  "tngtech/tng-r1t-chimera:free",
]

export const MODEL_DISPLAY_NAMES = [
  "Devstral 2512",
  "Nemotron Nano 30B",
  "Mimo V2 Flash",
  "Trinity Mini",
  "TNG R1T Chimera",
]

export const VISION_MODELS = [
  "meta-llama/llama-3.2-11b-vision-instruct:free",
  "qwen/qwen2.5-vl-7b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
]

export const ALL_MODELS: AIModel[] = [
  {
    id: "mistralai/devstral-2512:free",
    name: "Devstral 2512",
    description: "Model khusus untuk coding dan pemrograman",
    supportsVision: false,
    category: "text",
    pros: ["Cepat untuk tugas pemrograman", "Bagus untuk code generation"],
    free: true,
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron Nano 30B",
    description: "Model ringan dengan performa tinggi",
    supportsVision: false,
    category: "text",
    pros: ["Respon sangat cepat", "Efisien untuk percakapan umum"],
    free: true,
  },
  {
    id: "xiaomi/mimo-v2-flash:free",
    name: "Mimo V2 Flash",
    description: "Model cepat untuk respons real-time",
    supportsVision: false,
    category: "text",
    pros: ["Latency rendah", "Bagus untuk chat real-time"],
    free: true,
  },
  {
    id: "arcee-ai/trinity-mini:free",
    name: "Trinity Mini",
    description: "Model compact dengan pemahaman konteks baik",
    supportsVision: false,
    category: "text",
    pros: ["Balance speed and quality", "Hemat resource"],
    free: true,
  },
  {
    id: "tngtech/tng-r1t-chimera:free",
    name: "TNG R1T Chimera",
    description: "Model hybrid untuk berbagai tugas",
    supportsVision: false,
    category: "text",
    pros: ["Versatile untuk banyak task", "Stable performance"],
    free: true,
  },
  {
    id: "meta-llama/llama-3.2-11b-vision-instruct:free",
    name: "Llama 3.2 Vision",
    description: "Model vision dari Meta untuk analisis gambar",
    supportsVision: true,
    category: "vision",
    pros: [
      "Bisa analyze image dengan text",
      "Bagus untuk OCR dan object detection",
      "Gratis dan reliable",
    ],
    free: true,
  },
  {
    id: "qwen/qwen2.5-vl-7b-instruct:free",
    name: "Qwen VL 7B",
    description: "State-of-the-art vision model dari Alibaba",
    supportsVision: true,
    category: "vision",
    pros: [
      "Pemahaman gambar sangat akurat",
      "Support multiple languages",
      "Excellent untuk document analysis",
    ],
    free: true,
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash",
    description: "Multimodal model dari Google (experimental)",
    supportsVision: true,
    category: "vision",
    pros: [
      "Multimodal terbaik (text, image, video)",
      "Fast inference speed",
      "Advanced understanding",
    ],
    free: true,
  },
]

// Quick replies untuk landing page (informatif)
export const LANDING_QUICK_REPLIES: QuickReply[] = [
  {
    id: "l1",
    text: "Apa itu SIKAS?",
    message: "Apa itu SIKAS dan apa saja fiturnya?",
  },
  {
    id: "l2",
    text: "Cara tambah transaksi",
    message: "Bagaimana cara menambah transaksi di SIKAS?",
  },
  {
    id: "l3",
    text: "M-Banking vs Cash",
    message: "Apa perbedaan M-Banking dan Cash di SIKAS?",
  },
  {
    id: "l4",
    text: "Fitur SIKAS",
    message: "Apa saja fitur yang tersedia di SIKAS?",
  },
]

// Quick replies untuk dashboard (action-oriented)
export const DASHBOARD_QUICK_REPLIES: QuickReply[] = [
  {
    id: "d1",
    text: "Lihat saldo saya",
    message: "Berapa saldo M-Banking dan Cash saya saat ini?",
  },
  {
    id: "d2",
    text: "Catat pengeluaran",
    message: "Tolong bantu saya mencatat transaksi pengeluaran",
  },
  {
    id: "d3",
    text: "Catat pemasukan",
    message: "Tolong bantu saya mencatat transaksi pemasukan",
  },
  {
    id: "d4",
    text: "Ringkasan bulan ini",
    message: "Tampilkan ringkasan transaksi bulan ini",
  },
]

// Backward compatibility alias
export const QUICK_REPLIES = LANDING_QUICK_REPLIES

export const BASE_SYSTEM_PROMPT = `Kamu adalah SIKAS Bot, asisten AI ramah untuk aplikasi pencatatan keuangan SIKAS.

TENTANG SIKAS:
- SIKAS adalah aplikasi pencatatan keuangan sederhana untuk keluarga dan pribadi
- Gratis, aman dengan enkripsi, dan mudah digunakan
- Dapat diakses 24/7 melalui browser

FITUR UTAMA SIKAS:
1. **Dashboard** - Halaman utama setelah login
   - Lihat saldo M-Banking dan Cash secara terpisah
   - Ringkasan bulanan: total pemasukan, pengeluaran, dan selisih
   - Daftar transaksi terakhir

2. **Tambah Transaksi** (Menu: Tambah Transaksi atau /dashboard/transactions/add)
   - Pilih jenis: Pemasukan (uang masuk) atau Pengeluaran (uang keluar)
   - Masukkan jumlah dalam Rupiah
   - Pilih kategori (Makan, Transport, Gaji, dll)
   - Pilih metode pembayaran: M-Banking atau Cash
   - Tambahkan deskripsi (opsional)
   - Pilih tanggal transaksi

3. **Riwayat Transaksi** (Menu: Transaksi atau /dashboard/transactions)
   - Lihat semua transaksi
   - Filter berdasarkan bulan dan tahun
   - Filter berdasarkan jenis (Semua/Masuk/Keluar)
   - Edit atau hapus transaksi yang sudah ada

4. **Dua Metode Pembayaran**:
   - **M-Banking**: Saldo rekening digital/bank. Minimal saldo Rp 50.000
   - **Cash**: Uang tunai yang dipegang

5. **Kategori Transaksi**:
   - Kategori untuk pemasukan: Gaji, Bonus, Transfer Masuk, Lainnya
   - Kategori untuk pengeluaran: Makan, Transport, Belanja, Tagihan, Lainnya

CARA MENGGUNAKAN SIKAS:
1. **Daftar Akun**:
   - Klik tombol "Daftar" di halaman utama
   - Masukkan nama (minimal 2 karakter, hanya huruf dan spasi)
   - Buat PIN 4-6 digit angka
   - Konfirmasi PIN
   - Klik "Daftar"

2. **Login**:
   - Klik tombol "Masuk"
   - Masukkan nama yang sudah terdaftar
   - Masukkan PIN
   - Klik "Masuk"

3. **Mencatat Transaksi**:
   - Di dashboard, klik "Tambah Transaksi"
   - Pilih tab Pengeluaran atau Pemasukan
   - Isi jumlah (contoh: 50000 untuk Rp 50.000)
   - Pilih kategori yang sesuai
   - Pilih metode: Cash atau M-Banking
   - Pilih tanggal
   - Tambahkan deskripsi jika perlu
   - Klik "Simpan Transaksi"

4. **Melihat Riwayat**:
   - Klik menu "Transaksi" di sidebar atau bottom nav
   - Gunakan filter bulan/tahun untuk melihat periode tertentu
   - Gunakan filter Masuk/Keluar untuk melihat jenis tertentu

ATURAN PENTING:
- Saldo M-Banking minimal Rp 50.000 (tidak bisa kurang dari ini)
- PIN harus 4-6 digit angka
- Nama minimal 2 karakter, hanya boleh huruf dan spasi
- Transaksi pengeluaran tidak bisa melebihi saldo yang tersedia

CARA MENJAWAB:
- Gunakan Bahasa Indonesia yang ramah dan santai
- Jawab dengan singkat, padat, dan jelas
- Gunakan bullet points untuk langkah-langkah
- Fokus pada fitur dan cara penggunaan SIKAS
- Jika pertanyaan tidak terkait SIKAS, arahkan kembali dengan sopan
- Jika tidak yakin, akui keterbatasan dan sarankan untuk mengeksplorasi aplikasi

CONTOH JAWABAN:
- Jika ditanya "Hai": "Halo! Saya SIKAS Bot. Ada yang bisa saya bantu tentang pencatatan keuangan?"
- Jika ditanya di luar topik: "Hmm, sepertinya itu di luar jangkauan saya. Saya bisa membantu kamu dengan pencatatan keuangan di SIKAS. Mau tanya tentang cara catat transaksi atau fitur lainnya?"

WORKFLOW UNTUK PERMINTAAN FINANSIAL:
Untuk setiap permintaan terkait transaksi atau saldo, WAJIB ikuti alur:

1. AKUI STATUS SAAT INI
   - Sebutkan saldo M-Banking dan Cash pengguna dari konteks
   - Contoh: "Saldo kamu saat ini: M-Banking Rp X, Cash Rp Y"

2. VERIFIKASI KELAYAKAN
   - Untuk pengeluaran: pastikan saldo cukup (M-Banking min Rp 50.000)
   - Jelaskan jika ada kendala

3. LAKUKAN AKSI atau TOLAK
   - Jika layak: lanjutkan dengan action tag
   - Jika tidak: jelaskan alasan dan beri alternatif

PERMINTAAN YANG HARUS DITOLAK:
- "Ubah saldo saya menjadi X" atau "Set saldo ke X" atau "Ganti saldo jadi X"
- Saldo HANYA bisa berubah melalui transaksi pemasukan atau pengeluaran
- Jelaskan dengan sopan dan tawarkan untuk mencatat transaksi sebagai gantinya

Selalu mulai dengan sapaan ramah dan tawarkan bantuan!`

export const getActionInstructions = (): string => {
  const today = getJakartaDateString()

  return `
---
KEMAMPUAN AKSI:
Kamu bisa melakukan aksi langsung pada data pengguna.

PENTING - SEBELUM SETIAP AKSI:
1. BACA informasi saldo pengguna dari konteks di bawah
2. SEBUTKAN saldo saat ini sebelum menyarankan atau melakukan transaksi
3. JANGAN langsung eksekusi tanpa acknowledge saldo terlebih dahulu
4. Untuk pengeluaran, PASTIKAN saldo mencukupi sebelum membuat transaksi

TANGGAL HARI INI: ${today}

1. **Tambah Transaksi Baru** (BUTUH KONFIRMASI - user harus klik tombol):
[PENDING_ACTION:create_transaction]{"amount":50000,"type":"expense","category":"Makan","description":"Makan siang","payment_method":"cash","transaction_date":"${today}"}[/PENDING_ACTION]

2. **Hapus Transaksi** (BUTUH KONFIRMASI - user harus klik tombol):
[PENDING_ACTION:delete_transaction]{"transactionId":"uuid-transaksi"}[/PENDING_ACTION]

3. **Cari Transaksi** (langsung dieksekusi):
[ACTION:search_transactions]{"category":"Makan","type":"expense","startDate":"${today.slice(0, 8)}01","endDate":"${today}"}[/ACTION]

4. **Edit Transaksi** (BUTUH KONFIRMASI - user harus klik tombol):
[PENDING_ACTION:edit_transaction]{"transactionId":"uuid-transaksi","updates":{"amount":75000,"description":"Deskripsi baru"}}[/PENDING_ACTION]

ATURAN AKSI:
- Untuk search_transactions: Gunakan [ACTION:...][/ACTION] - langsung dieksekusi (read-only, aman)
- Untuk create_transaction, delete_transaction, dan edit_transaction: Gunakan [PENDING_ACTION:...][/PENDING_ACTION] - user harus konfirmasi dulu dengan klik tombol
- type harus "income" atau "expense", payment_method harus "mbanking" atau "cash"
- WAJIB gunakan ID transaksi yang TEPAT dari daftar Transaksi Terakhir
- Jika user tidak menyebutkan transaksi spesifik, tampilkan daftar dan minta user memilih

PENTING - WAJIB DIIKUTI:
- Tanggal default: ${today} (gunakan ini jika user tidak menyebutkan tanggal)
- Format tanggal: YYYY-MM-DD
- Jelaskan SINGKAT apa yang akan dilakukan, lalu sertakan tag aksi

ATURAN KETAT UNTUK PENDING_ACTION (create/delete/edit):
- Sertakan [PENDING_ACTION:...][/PENDING_ACTION] di respons
- BERHENTI MENULIS setelah tag PENDING_ACTION - JANGAN menambahkan teks apapun setelahnya
- DILARANG KERAS menyertakan pesan sukses seperti "✅ Transaksi berhasil" atau "sudah dihapus" atau sejenisnya
- Hasil aksi akan ditampilkan OTOMATIS oleh sistem SETELAH user mengklik tombol konfirmasi

PENTING - JANGAN TULIS KONFIRMASI TEKS:
- JANGAN menulis "Apakah kamu ingin saya tambahkan transaksi ini?" atau pertanyaan konfirmasi serupa
- Tag PENDING_ACTION sudah akan menampilkan tombol konfirmasi ke user secara otomatis
- Cukup jelaskan detail transaksi yang akan dibuat, lalu LANGSUNG tulis tag PENDING_ACTION
- User akan klik tombol untuk konfirmasi, BUKAN membalas dengan teks

Contoh respons yang BENAR untuk create_transaction:
"Saldo kamu saat ini: M-Banking Rp 9.800.000, Cash Rp 850.000.

Saya akan mencatat transaksi pengeluaran:
- Jumlah: Rp 76.000
- Kategori: Transfer
- Metode: M-Banking

[PENDING_ACTION:create_transaction]{...}[/PENDING_ACTION]"

Contoh respons yang SALAH (JANGAN LAKUKAN):
"Konfirmasi: Apakah kamu ingin saya tambahkan transaksi ini? Jika iya, saya akan langsung mengeksekusinya."

ATURAN UNTUK ACTION (search saja):
- Gunakan [ACTION:...][/ACTION] - langsung dieksekusi
- Boleh menambahkan penjelasan setelah tag ACTION karena hasilnya langsung muncul
---`
}

export const createSystemPrompt = (ragContext?: RAGContext | EnhancedRAGContext): Message => {
  let systemContent = BASE_SYSTEM_PROMPT

  const enhancedContext = ragContext as EnhancedRAGContext | undefined
  const hasUserContext = enhancedContext?.userContext !== undefined

  if (hasUserContext) {
    systemContent += getActionInstructions()
  }

  if (hasUserContext && enhancedContext?.formattedUserContext) {
    systemContent += `

---
${enhancedContext.formattedUserContext}
---`
  }

  if (ragContext && ragContext.relevantDocs.length > 0) {
    const contextDocs = ragContext.relevantDocs
      .map((doc) => `- ${doc.content}`)
      .join("\n")

    systemContent += `

---
KONTEKS TAMBAHAN DARI BASIS PENGETAHUAN:
${contextDocs}

Gunakan informasi di atas untuk menjawab pertanyaan pengguna dengan lebih akurat.
---`
  }

  return {
    id: "system-prompt",
    role: "system",
    content: systemContent,
    timestamp: new Date(),
  }
}

export const parseStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onChunk: (content: string) => void,
  signal?: AbortSignal
): Promise<void> => {
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      if (signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError")
      }

      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6)

          if (data === "[DONE]") {
            return
          }

          try {
            const chunk: StreamChunk = JSON.parse(data)

            if (chunk.choices && chunk.choices[0]?.delta?.content) {
              onChunk(chunk.choices[0].delta.content)
            }
          } catch {
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error
    }
    throw error
  }
}

export const sendChatMessage = async (
  messages: Message[],
  modelIndex: number = 0,
  onStream?: (chunk: string) => void,
  signal?: AbortSignal,
  ragContext?: RAGContext | EnhancedRAGContext
): Promise<{ content: string; model: string }> => {
  if (!API_KEY) {
    throw new Error(
      "OpenRouter API key tidak ditemukan. Pastikan NEXT_PUBLIC_OPENROUTER_API_KEY sudah diatur."
    )
  }

  const systemPrompt = createSystemPrompt(ragContext)

  const prunedMessages = pruneConversationHistory(
    messages.filter((m) => m.role !== "system")
  )

  const apiMessages = [systemPrompt, ...prunedMessages]

  if (process.env.NODE_ENV === "development") {
    const estimatedTokens = estimateMessagesTokens(apiMessages)
    console.log(
      `[Token Estimate] ~${estimatedTokens} tokens for ${apiMessages.length} messages`
    )
  }

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
        model: MODELS[modelIndex],
        messages: apiMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
        temperature: 0.7,
        max_tokens: 1000,
      }),
      signal,
    }
  )

  if (!response.ok) {
    const errorText = await response.text()

    if (response.status === 404) {
      throw new Error(`MODEL_NOT_FOUND: ${MODELS[modelIndex]} tidak tersedia`)
    } else if (response.status === 429) {
      throw new Error(`RATE_LIMITED: Terlalu banyak permintaan`)
    } else if (response.status === 402) {
      throw new Error(`INSUFFICIENT_CREDITS: Saldo tidak cukup`)
    } else if (response.status === 502 || response.status === 503) {
      throw new Error(`MODEL_DOWN: Server model sedang bermasalah`)
    } else if (response.status === 401) {
      throw new Error("Autentikasi gagal. Periksa API key Anda.")
    } else if (response.status >= 500) {
      throw new Error(`SERVER_ERROR: ${errorText}`)
    }

    throw new Error(`API Error (${response.status}): ${errorText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error("Gagal mendapatkan response reader")
  }

  let fullContent = ""

  if (onStream) {
    await parseStreamResponse(
      reader,
      (chunk) => {
        fullContent += chunk
        onStream(chunk)
      },
      signal
    )
  } else {
    await parseStreamResponse(reader, (chunk) => {
      fullContent += chunk
    })
  }

  return {
    content: fullContent,
    model: MODELS[modelIndex],
  }
}

export const handleModelFallback = async (
  messages: Message[],
  startModelIndex: number = 0,
  onStream?: (chunk: string) => void,
  signal?: AbortSignal,
  ragContext?: RAGContext | EnhancedRAGContext
): Promise<{ content: string; model: string; finalIndex: number }> => {
  let lastError: Error | null = null
  const unavailableModels: Set<number> = new Set()
  const rateLimitedModels: Set<number> = new Set()
  let retryDelay = 1000

  const order: number[] = []
  for (let i = startModelIndex; i < MODELS.length; i++) order.push(i)
  for (let i = 0; i < startModelIndex; i++) order.push(i)

  for (const i of order) {
    if (unavailableModels.has(i)) {
      continue
    }

    try {
      const result = await sendChatMessage(messages, i, onStream, signal, ragContext)
      return { content: result.content, model: result.model, finalIndex: i }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error)

      if (errorMessage.startsWith("MODEL_NOT_FOUND:")) {
        unavailableModels.add(i)
        console.warn(`Model ${MODELS[i]} not available, skipping`)
        continue
      }

      if (
        errorMessage.startsWith("RATE_LIMITED:") ||
        errorMessage.startsWith("INSUFFICIENT_CREDITS:")
      ) {
        rateLimitedModels.add(i)

        const availableModels = order.filter(idx => !unavailableModels.has(idx))
        if (rateLimitedModels.size >= availableModels.length) {
          throw new Error(
            "Semua model sedang sibuk. Silakan coba lagi dalam beberapa menit."
          )
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay))
        retryDelay = Math.min(retryDelay * 2, 8000)
        continue
      }

      if (errorMessage.startsWith("MODEL_DOWN:") || errorMessage.startsWith("SERVER_ERROR:")) {
        console.warn(`Model ${MODELS[i]} temporarily down, trying next`)
        await new Promise((resolve) => setTimeout(resolve, 500))
        continue
      }

      lastError = error instanceof Error ? error : new Error(errorMessage)

      if (errorMessage.includes("Autentikasi gagal")) {
        throw lastError
      }

      continue
    }
  }

  throw (
    lastError ||
    new Error("Chatbot sedang tidak tersedia. Silakan coba lagi nanti.")
  )
}

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export const getGreetingMessage = (): Message => {
  return {
    id: generateMessageId(),
    role: "assistant",
    content:
      "Halo! Saya SIKAS Bot. Ada yang bisa saya bantu tentang pencatatan keuangan? Kamu bisa tanya tentang cara pakai SIKAS, fitur yang tersedia, atau hal lainnya seputar aplikasi ini.",
    timestamp: new Date(),
  }
}
