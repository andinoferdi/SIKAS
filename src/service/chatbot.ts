import { type Message, type StreamChunk, type QuickReply } from "@/types/chatbot"

const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "SIKAS"

export const MODELS = [
  "meta-llama/llama-4-maverick:free",
  "mistralai/mistral-small-3.2-24b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-4-scout:free",
  "mistralai/mistral-small-3.1-24b-instruct:free",
  "qwen/qwen2.5-vl-32b-instruct:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-3-12b-it:free",
  "google/gemma-3-4b-it:free",
]

export const MODEL_DISPLAY_NAMES = [
  "Llama 4 Maverick",
  "Mistral Small 3.2",
  "Gemini 2.0 Flash",
  "Llama 4 Scout",
  "Mistral Small 3.1",
  "Qwen 2.5 VL",
  "Gemma 3 27B",
  "Gemma 3 12B",
  "Gemma 3 4B",
]

export const QUICK_REPLIES: QuickReply[] = [
  {
    id: "1",
    text: "Apa itu SIKAS?",
    message: "Apa itu SIKAS dan apa saja fiturnya?",
  },
  {
    id: "2",
    text: "Cara tambah transaksi",
    message: "Bagaimana cara menambah transaksi di SIKAS?",
  },
  {
    id: "3",
    text: "M-Banking vs Cash",
    message: "Apa perbedaan M-Banking dan Cash di SIKAS?",
  },
  {
    id: "4",
    text: "Fitur SIKAS",
    message: "Apa saja fitur yang tersedia di SIKAS?",
  },
]

export const createSystemPrompt = (): Message => {
  const systemContent = `Kamu adalah SIKAS Bot, asisten AI ramah untuk aplikasi pencatatan keuangan SIKAS.

TENTANG SIKAS:
- SIKAS adalah aplikasi pencatatan keuangan sederhana untuk keluarga dan pribadi
- Gratis, aman dengan enkripsi, dan mudah digunakan
- Dapat diakses 24/7 melalui browser

FITUR UTAMA SIKAS:
1. **Dashboard** - Halaman utama setelah login
   - Lihat saldo M-Banking dan Cash secara terpisah
   - Ringkasan bulanan: total pemasukan, pengeluaran, dan selisih
   - Daftar transaksi terakhir

2. **Tambah Transaksi** (Menu: Tambah Transaksi atau /dashboard/add)
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

Selalu mulai dengan sapaan ramah dan tawarkan bantuan!`

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
            // Skip invalid JSON chunks
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
  signal?: AbortSignal
): Promise<{ content: string; model: string }> => {
  if (!API_KEY) {
    throw new Error(
      "OpenRouter API key tidak ditemukan. Pastikan NEXT_PUBLIC_OPENROUTER_API_KEY sudah diatur."
    )
  }

  const systemPrompt = createSystemPrompt()
  const apiMessages = [
    systemPrompt,
    ...messages.filter((m) => m.role !== "system"),
  ]

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
    let errorMessage = `API Error (${response.status}): ${errorText}`

    if (response.status === 401) {
      errorMessage = "Autentikasi gagal. Periksa API key Anda."
    } else if (response.status === 402) {
      errorMessage = "Saldo tidak cukup. Mencoba model lain..."
    } else if (response.status === 429) {
      errorMessage = "Terlalu banyak permintaan. Silakan coba lagi nanti."
    } else if (response.status >= 500) {
      errorMessage = "Server sedang bermasalah. Silakan coba lagi nanti."
    }

    throw new Error(errorMessage)
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
  signal?: AbortSignal
): Promise<{ content: string; model: string; finalIndex: number }> => {
  let lastError: Error | null = null
  const failedModels: string[] = []

  const order: number[] = []
  for (let i = startModelIndex; i < MODELS.length; i++) order.push(i)
  for (let i = 0; i < startModelIndex; i++) order.push(i)

  for (const i of order) {
    try {
      const result = await sendChatMessage(messages, i, onStream, signal)
      return { content: result.content, model: result.model, finalIndex: i }
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error)

      if (
        errorMessage.includes("429") ||
        errorMessage.includes("402") ||
        errorMessage.includes("Rate limit")
      ) {
        failedModels.push(MODEL_DISPLAY_NAMES[i])

        if (failedModels.length === MODELS.length) {
          throw new Error(
            "Chatbot sedang tidak tersedia. Silakan coba lagi nanti."
          )
        }

        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      lastError = error instanceof Error ? error : new Error(errorMessage)
      continue
    }
  }

  throw (
    lastError ||
    new Error("Chatbot sedang tidak tersedia. Silakan coba lagi nanti.")
  )
}

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
