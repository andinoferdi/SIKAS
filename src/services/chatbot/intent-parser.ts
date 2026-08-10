import type { CreateTransactionPayload, EditTransactionPayload } from "@/types/rag"
import { getJakartaDateString } from "@/lib/utils/format"

/*
  Bentuk berimbuhan didaftar eksplisit, bukan dengan melonggarkan batas kata.
  Pola lama `\bcatat\b` tidak pernah cocok dengan "mencatat" karena huruf n di
  depannya memblokir batas kata, sehingga kalimat sewajarnya seperti "tolong
  bantu saya mencatat" tidak dikenali sebagai niat mencatat. Melepas batas kata
  akan memperbaiki itu tapi membuat kata benda "pemasukan" ikut cocok lewat
  "masuk", dan pertanyaan saldo yang menyebutnya akan salah rute.
*/
const CREATE_VERBS =
  /\b(catat|mencatat|dicatat|catatkan|tambah|tambahkan|menambah|menambahkan|ditambah|ditambahkan|buat|buatkan|membuat|dibuat|masukkan|masukan|memasukkan|dimasukkan|dimasukan|masukin)\b/i
const DELETE_VERBS = /\b(hapus|delete|remove)\b/i
const EDIT_VERBS = /\b(edit|ubah|ganti|koreksi)\b/i
const BALANCE_TERMS = /\b(saldo|balance|duit|uang saya|uangku)\b/i
const LATEST_TRANSACTION_TERMS = /\b(transaksi (terakhir|terbaru)|riwayat terakhir)\b/i
const SUCCESS_WITHOUT_ACTION_TERMS =
  /\b(saya telah mencatat|berhasil ditambahkan|berhasil dicatat|saldo .* sekarang menjadi|transaksi baru)\b/i
const MANUAL_TUTORIAL_TERMS =
  /\b(riwayat transaksi|klik tombol|akses halaman|untuk mengedit|untuk menghapus|secara manual)\b/i

const CATEGORY_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  { category: "Gaji", pattern: /\bgaji\b/i },
  { category: "Bonus", pattern: /\bbonus\b/i },
  { category: "Transfer Masuk", pattern: /\btransfer masuk\b/i },
  { category: "Makan", pattern: /\b(makan|makanan|sarapan|lunch|dinner|minum)\b/i },
  { category: "Transport", pattern: /\b(transport|bensin|ojek|taksi|taxi|grab|gojek|bus|kereta)\b/i },
  { category: "Belanja", pattern: /\b(belanja|shopping)\b/i },
  { category: "Tagihan", pattern: /\b(tagihan|listrik|air|internet|telepon|pulsa)\b/i },
  { category: "Lainnya", pattern: /\b(lainnya|lain)\b/i },
]

const parseScaledNumber = (value: string): number | null => {
  const normalized = value.toLowerCase().replace(/rp|idr|\s/g, "")

  const jutaMatch = normalized.match(/^(\d+(?:[.,]\d+)*)?(jt|juta)$/)
  if (jutaMatch) {
    const amount = Number(jutaMatch[1]?.replace(",", ".") || "0")
    return Number.isFinite(amount) ? Math.round(amount * 1_000_000) : null
  }

  const ribuMatch = normalized.match(/^(\d+(?:[.,]\d+)*)?(rb|ribu)$/)
  if (ribuMatch) {
    const amount = Number(ribuMatch[1]?.replace(",", ".") || "0")
    return Number.isFinite(amount) ? Math.round(amount * 1_000) : null
  }

  const stripped = normalized.replace(/[^\d]/g, "")
  if (!stripped) return null

  const parsed = Number.parseInt(stripped, 10)
  return Number.isFinite(parsed) ? parsed : null
}

/*
  Nominal bentuk kata ("lima puluh ribu"). Tanpa ini kalimat sehari-hari tidak
  tertangkap jalur deterministik dan terlempar ke LLM, yang belum tentu
  mengeluarkan blok aksi sehingga transaksinya tidak pernah tercatat.
*/
const WORD_UNITS: Record<string, number> = {
  nol: 0,
  satu: 1,
  dua: 2,
  tiga: 3,
  empat: 4,
  lima: 5,
  enam: 6,
  tujuh: 7,
  delapan: 8,
  sembilan: 9,
}

const WORD_SCALES: Record<string, number> = {
  ribu: 1_000,
  juta: 1_000_000,
  miliar: 1_000_000_000,
  milyar: 1_000_000_000,
}

const WORD_TOKENS = [
  "sembilan",
  "sepuluh",
  "sebelas",
  "seratus",
  "seribu",
  "sejuta",
  "delapan",
  "tujuh",
  "empat",
  "enam",
  "lima",
  "tiga",
  "satu",
  "dua",
  "nol",
  "belas",
  "puluh",
  "ratus",
  "ribu",
  "juta",
  "miliar",
  "milyar",
]

const WORD_RUN_PATTERN = new RegExp(
  `\\b((?:${WORD_TOKENS.join("|")})(?:\\s+(?:${WORD_TOKENS.join("|")}))*)\\b`,
  "i"
)

const parseWordNumber = (phrase: string): number | null => {
  let total = 0
  let current = 0
  let last = 0
  let sawScale = false

  for (const token of phrase.toLowerCase().split(/\s+/)) {
    if (token in WORD_UNITS) {
      last = WORD_UNITS[token]
      continue
    }

    switch (token) {
      case "sepuluh":
        last = 10
        break
      case "sebelas":
        last = 11
        break
      case "belas":
        last = 10 + last
        break
      case "puluh":
        current += (last || 1) * 10
        last = 0
        break
      case "seratus":
        current += 100
        break
      case "ratus":
        current += (last || 1) * 100
        last = 0
        break
      case "seribu":
        total += 1_000
        current = 0
        last = 0
        sawScale = true
        break
      case "sejuta":
        total += 1_000_000
        current = 0
        last = 0
        sawScale = true
        break
      default: {
        const scale = WORD_SCALES[token]
        if (!scale) return null
        total += (current + last || 1) * scale
        current = 0
        last = 0
        sawScale = true
      }
    }
  }

  /*
    Tanpa satuan skala, "dua" pada kalimat biasa akan terbaca sebagai Rp 2.
    Nominal bentuk kata hanya diterima bila menyebut ribu, juta, atau miliar.
  */
  if (!sawScale) return null

  const amount = total + current + last
  return amount > 0 ? amount : null
}

const extractAmountFromWords = (content: string): number | null => {
  const match = content.match(WORD_RUN_PATTERN)
  if (!match) return null
  return parseWordNumber(match[1])
}

const extractAmountFromText = (content: string): number | null => {
  const unitMatch = content.match(/(?:rp\.?\s*)?(\d+(?:[.,]\d+)*)\s*(rb|ribu|jt|juta)\b/i)
  if (unitMatch) {
    return parseScaledNumber(`${unitMatch[1]}${unitMatch[2]}`)
  }

  const currencyMatch = content.match(/rp\.?\s*(\d{1,3}(?:[.\s,]\d{3})+|\d{4,})/i)
  if (currencyMatch) {
    return parseScaledNumber(currencyMatch[1])
  }

  const longNumberMatch = content.match(/\b(\d{4,})\b/)
  if (longNumberMatch) {
    return parseScaledNumber(longNumberMatch[1])
  }

  return extractAmountFromWords(content)
}

const detectPaymentMethod = (content: string): "cash" | "mbanking" | null => {
  if (/\b(cash|tunai)\b/i.test(content)) return "cash"
  if (/\b(m-?banking|mbanking|bank)\b/i.test(content)) return "mbanking"
  return null
}

const levenshteinDistance = (a: string, b: string): number => {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => i)
  for (let j = 1; j <= b.length; j++) {
    let previousDiagonal = rows[0]
    rows[0] = j
    for (let i = 1; i <= a.length; i++) {
      const previous = rows[i]
      rows[i] = a[i - 1] === b[j - 1]
        ? previousDiagonal
        : 1 + Math.min(previousDiagonal, rows[i], rows[i - 1])
      previousDiagonal = previous
    }
  }
  return rows[a.length]
}

/*
  Dipakai di batas API (bukan hanya saat parsing kalimat bebas) karena JSON
  aksi transaksi juga bisa datang dari model LLM, yang kadang menyalin typo
  user apa adanya (mis. "mbangking"). detectPaymentMethod berbasis word
  boundary tidak menangkap typo, jadi nilai mentah bisa lolos sampai ke
  constraint database. Jarak edit menoleransi typo umum tanpa membuka celah
  untuk nilai yang benar-benar tidak dikenal.
*/
export const normalizePaymentMethod = (value: unknown): "cash" | "mbanking" | null => {
  if (typeof value !== "string") return null
  const normalized = value.trim().toLowerCase()
  if (normalized === "cash" || normalized === "mbanking") return normalized
  const direct = detectPaymentMethod(normalized)
  if (direct) return direct
  if (levenshteinDistance(normalized, "mbanking") <= 2) return "mbanking"
  if (levenshteinDistance(normalized, "cash") <= 1) return "cash"
  return null
}

const detectTransactionType = (
  content: string
): CreateTransactionPayload["type"] | null => {
  if (/\b(pemasukan|income|masuk|gaji|bonus|transfer masuk)\b/i.test(content)) {
    return "income"
  }

  if (/\b(pengeluaran|expense|bayar|beli|keluar|spend)\b/i.test(content)) {
    return "expense"
  }

  return null
}

const detectCategory = (content: string): string => {
  const matched = CATEGORY_PATTERNS.find(({ pattern }) => pattern.test(content))
  return matched?.category || "Lainnya"
}

const extractDescription = (content: string): string | undefined => {
  const quoted = content.match(/["']([^"']{3,80})["']/)
  if (quoted?.[1]) {
    return quoted[1].trim()
  }

  const descriptionMatch = content.match(
    /\b(?:deskripsi|catatan|keterangan)\s*(?:nya)?\s*(?:jadi|ke|=|:)?\s*([a-z0-9\s-]{3,80})$/i
  )

  return descriptionMatch?.[1]?.trim()
}

const normalizeMessage = (content: string): string => {
  return content.toLowerCase().replace(/\s+/g, " ").trim()
}

export function isLikelyCreateIntent(content: string): boolean {
  const normalized = normalizeMessage(content)
  return CREATE_VERBS.test(normalized) && extractAmountFromText(normalized) !== null
}

export function isLikelyBalanceQuery(content: string): boolean {
  const normalized = normalizeMessage(content)
  if (!BALANCE_TERMS.test(normalized)) {
    return false
  }

  /*
    Perintah eksplisit menang atas kata benda yang kebetulan lewat. Tanpa ini,
    kalimat seperti "catat pemasukan mbanking 500rb, anggap saja saldo awal"
    terbaca sebagai pertanyaan saldo hanya karena mengandung kata "saldo" dan
    "saya", lalu dijawab dengan angka saldo dan perintah mencatatnya hilang.
  */
  if (isLikelyCreateIntent(normalized)) {
    return false
  }

  if (/\b(set|atur|ubah)\b.*\bsaldo\b/i.test(normalized)) {
    return false
  }

  if (/\b(cara|bagaimana|tutorial|fitur|jelaskan)\b/i.test(normalized)) {
    return false
  }

  return /\b(berapa|cek|lihat|tampilkan|saat ini|sekarang|saya|ku)\b/i.test(normalized)
}

/*
  Angka telanjang hanya diterima pada posisi target ("... jadi 0"). Di teks
  bebas angka pendek sengaja ditolak agar "beli 2 roti" tidak terbaca sebagai
  Rp 2, tapi di sini angkanya tidak ambigu dan menyetel saldo ke nol itu sah.
*/
const extractBareTarget = (phrase: string): number | null => {
  const match = phrase.match(/^\s*(?:rp\.?\s*)?(\d[\d.,]*)\s*(?:rupiah)?\s*$/i)
  if (!match) return null

  const digits = match[1].replace(/[^\d]/g, "")
  if (!digits) return null

  const parsed = Number.parseInt(digits, 10)
  return Number.isFinite(parsed) ? parsed : null
}

export interface SetBalanceTarget {
  paymentMethod: "cash" | "mbanking"
  target: number
}

/*
  "atur saldo mbanking jadi 500rb". Selisihnya dihitung di server lalu
  dituangkan jadi transaksi penyesuaian, bukan menimpa kolom saldo, supaya
  riwayat tetap nyambung. Sebelumnya seluruh aritmetika ini diserahkan ke LLM
  lewat system prompt, dan model gratis kerap menjawab prosa tanpa blok aksi
  atau salah hitung. Hitungan uang tidak boleh bergantung pada model bahasa.
*/
export function extractSetBalanceTarget(content: string): SetBalanceTarget | null {
  const normalized = normalizeMessage(content)

  if (!/\b(atur|set|ubah|jadikan|ganti)\b/.test(normalized)) return null
  if (!/\bsaldo\b/.test(normalized)) return null

  /* Wajib menyebut target, supaya "ubah saldo" tanpa angka tidak ikut tertangkap. */
  const targetPhrase = normalized.match(/\b(?:jadi|menjadi|ke|jd)\b\s*(.+)$/)
  if (!targetPhrase) return null

  const target = extractAmountFromText(targetPhrase[1]) ?? extractBareTarget(targetPhrase[1])
  if (target === null || target < 0) return null

  const paymentMethod = detectPaymentMethod(normalized)
  if (!paymentMethod) return null

  return { paymentMethod, target }
}

export function isLikelyLatestTransactionQuery(content: string): boolean {
  const normalized = normalizeMessage(content)
  return (
    LATEST_TRANSACTION_TERMS.test(normalized) &&
    !DELETE_VERBS.test(normalized) &&
    !EDIT_VERBS.test(normalized)
  )
}

export function isLikelyDeleteLatestIntent(content: string): boolean {
  const normalized = normalizeMessage(content)
  return DELETE_VERBS.test(normalized) && LATEST_TRANSACTION_TERMS.test(normalized)
}

export function isLikelyEditLatestIntent(content: string): boolean {
  const normalized = normalizeMessage(content)
  return EDIT_VERBS.test(normalized) && LATEST_TRANSACTION_TERMS.test(normalized)
}

export function extractCreateTransactionPayload(
  content: string,
  transactionDate: string = getJakartaDateString()
): CreateTransactionPayload | null {
  if (!isLikelyCreateIntent(content)) {
    return null
  }

  const amount = extractAmountFromText(content)
  const type = detectTransactionType(content)
  const paymentMethod = detectPaymentMethod(content)

  if (!amount || !type || !paymentMethod) {
    return null
  }

  return {
    amount,
    type,
    category: detectCategory(content),
    payment_method: paymentMethod,
    transaction_date: transactionDate,
    ...(extractDescription(content) && { description: extractDescription(content) }),
  }
}

/*
  Pencatatan yang dibangun dari dua pesan. Pengguna sering membuka dengan niat
  saja ("tolong bantu saya mencatat transaksi pemasukan"), bot menanyakan
  detailnya, lalu pengguna menjawab dengan angka dan metode saja tanpa mengulang
  kata kerjanya. Jalur cepat dulu melewatkan kasus ini karena hanya memeriksa
  satu pesan terakhir, sehingga percakapan jatuh ke LLM yang kerap menjawab
  prosa tanpa blok aksi dan kartu konfirmasinya tidak pernah muncul.

  Penggabungan dibatasi pada pesan pengguna tepat sebelumnya, dan hanya jika
  pesan itu memang berisi kata kerja perintah sementara pesan terakhir tidak.
  Bila gabungannya tetap tidak lengkap, hasilnya null dan alurnya kembali ke
  perilaku lama.
*/
export function extractCreateFollowUpPayload(
  previousUserMessage: string,
  message: string,
  transactionDate: string = getJakartaDateString()
): CreateTransactionPayload | null {
  if (!previousUserMessage.trim()) return null

  /* Pesan terakhir sudah lengkap sendiri, bukan urusan fungsi ini. */
  if (isLikelyCreateIntent(message)) return null

  const sebelumnya = normalizeMessage(previousUserMessage)
  if (!CREATE_VERBS.test(sebelumnya)) return null

  return extractCreateTransactionPayload(`${previousUserMessage} ${message}`, transactionDate)
}

export function extractEditTransactionUpdates(
  content: string
): EditTransactionPayload["updates"] {
  const updates: EditTransactionPayload["updates"] = {}
  const normalized = normalizeMessage(content)
  const hasLatestEditIntent = isLikelyEditLatestIntent(content)
  const amount = extractAmountFromText(normalized)

  if (amount && (/\b(jumlah|nominal|nilai)\b/i.test(normalized) || hasLatestEditIntent)) {
    updates.amount = amount
  }

  if (/\bkategori\b/i.test(normalized)) {
    updates.category = detectCategory(normalized)
  } else if (hasLatestEditIntent) {
    const detectedCategory = detectCategory(normalized)
    if (detectedCategory !== "Lainnya") {
      updates.category = detectedCategory
    }
  }

  if (/\b(metode|pembayaran|bayar|cash|tunai|m-?banking|mbanking|bank)\b/i.test(normalized)) {
    const paymentMethod = detectPaymentMethod(normalized)
    if (paymentMethod) {
      updates.payment_method = paymentMethod
    }
  }

  if (/\b(jenis|tipe)\b/i.test(normalized)) {
    const type = detectTransactionType(normalized)
    if (type) {
      updates.type = type
    }
  } else if (hasLatestEditIntent) {
    const type = detectTransactionType(normalized)
    if (type) {
      updates.type = type
    }
  }

  const description = extractDescription(content)
  if (description) {
    updates.description = description
  }

  const isoDateMatch = normalized.match(/\b(20\d{2}-\d{2}-\d{2})\b/)
  if (isoDateMatch?.[1]) {
    updates.transaction_date = isoDateMatch[1]
  }

  return updates
}

export function shouldUseCreateFallback(
  userMessage: string,
  assistantContent: string
): boolean {
  if (!isLikelyCreateIntent(userMessage)) {
    return false
  }

  const normalizedAssistant = normalizeMessage(assistantContent)
  if (MANUAL_TUTORIAL_TERMS.test(normalizedAssistant)) {
    return false
  }

  if (LATEST_TRANSACTION_TERMS.test(normalizedAssistant)) {
    return false
  }

  return /\b(saya akan|saya siapkan|konfirmasi|detail transaksi|jumlah:|nominal:)\b/i.test(
    normalizedAssistant
  )
}

export function isActionlessSuccessReply(
  userMessage: string,
  assistantContent: string
): boolean {
  if (!isLikelyCreateIntent(userMessage)) {
    return false
  }

  return SUCCESS_WITHOUT_ACTION_TERMS.test(normalizeMessage(assistantContent))
}
