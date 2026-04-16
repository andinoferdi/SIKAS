import type { CreateTransactionPayload, EditTransactionPayload } from "@/types/rag"
import { getJakartaDateString } from "@/lib/utils/format"

const CREATE_VERBS = /\b(catat|tambah(?:kan)?|buat(?:kan)?|masukkan)\b/i
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

  return null
}

const detectPaymentMethod = (content: string): "cash" | "mbanking" | null => {
  if (/\b(cash|tunai)\b/i.test(content)) return "cash"
  if (/\b(m-?banking|mbanking|bank)\b/i.test(content)) return "mbanking"
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

  if (/\b(set|atur|ubah)\b.*\bsaldo\b/i.test(normalized)) {
    return false
  }

  if (/\b(cara|bagaimana|tutorial|fitur|jelaskan)\b/i.test(normalized)) {
    return false
  }

  return /\b(berapa|cek|lihat|tampilkan|saat ini|sekarang|saya|ku)\b/i.test(normalized)
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
