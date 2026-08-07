import "server-only"

import type { AIModel, Message } from "@/types/chatbot"
import { selectAutomaticModel } from "@/services/chatbot/core"

/*
  Helper OpenRouter khusus server. Daftar model gratis diambil langsung dari
  OpenRouter dan di-cache satu jam, sehingga model gratis baru muncul sendiri
  tanpa perlu mengubah kode atau env. Penyaringan dan pemilihan otomatis
  dilakukan di berkas ini juga, supaya /api/chatbot/chat dan
  /api/chatbot/models selalu sepakat memakai daftar yang sama.
*/

const BASE_URL = "https://openrouter.ai/api/v1"
const MODELS_URL = `${BASE_URL}/models`
const CACHE_SECONDS = 3600

/*
  Model yang tugasnya bukan percakapan umum (moderasi, guardrail, keamanan).
  Dikeluarkan dari pemilihan otomatis supaya model terbaru yang terpilih
  tetap berguna sebagai asisten, bukan penyaring konten.
*/
const NON_CHAT = /(content-safety|guardrail|moderation|\bguard\b|\bsafety\b)/i

/*
  Dipakai hanya bila panggilan ke OpenRouter gagal, misalnya saat jaringan
  bermasalah. Nilainya bisa ditimpa lewat OPENROUTER_MODEL.
*/
const PINNED_FALLBACK = "meta-llama/llama-3.3-70b-instruct:free"

export type FreeModel = {
  id: string
  label: string
  vision: boolean
  created: number
}

type RawModel = {
  id?: unknown
  name?: unknown
  created?: unknown
  pricing?: { prompt?: unknown; completion?: unknown }
  architecture?: { input_modalities?: unknown }
}

export const getOpenRouterApiKey = (): string => {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum dikonfigurasi.")
  }

  return apiKey
}

export const getOpenRouterBaseUrl = (): string => BASE_URL

/*
  Header rujukan yang diminta OpenRouter agar trafik dapat diatribusikan.
  Keduanya opsional di sisi OpenRouter, jadi tidak dijadikan syarat wajib.
*/
export const getOpenRouterHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getOpenRouterApiKey()}`,
    "Content-Type": "application/json",
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) headers["HTTP-Referer"] = siteUrl
  headers["X-Title"] = "SIKAS"

  return headers
}

const isFree = (model: RawModel): boolean => {
  if (typeof model.id === "string" && model.id.endsWith(":free")) return true
  const pricing = model.pricing
  return Boolean(pricing && pricing.prompt === "0" && pricing.completion === "0")
}

const normalize = (model: RawModel): FreeModel | null => {
  if (typeof model.id !== "string") return null

  const modalities = model.architecture?.input_modalities
  const vision = Array.isArray(modalities) && modalities.includes("image")
  const rawLabel = typeof model.name === "string" ? model.name : model.id

  return {
    id: model.id,
    label: rawLabel.replace(/\s*\(free\)\s*$/i, "").trim(),
    vision,
    created: Number(model.created) || 0,
  }
}

/* Daftar model gratis yang masih hidup, terbaru lebih dulu. */
export const getFreeModels = async (): Promise<FreeModel[]> => {
  const response = await fetch(MODELS_URL, {
    headers: { Accept: "application/json" },
    next: { revalidate: CACHE_SECONDS },
  })

  if (!response.ok) {
    throw new Error(`Gagal memuat daftar model OpenRouter: ${response.status}`)
  }

  const json = (await response.json()) as { data?: RawModel[] }
  const list = Array.isArray(json.data) ? json.data : []

  return list
    .filter(isFree)
    .map(normalize)
    .filter((model): model is FreeModel => model !== null)
    .sort((a, b) => b.created - a.created)
}

/*
  Selalu mengembalikan sesuatu. Bila OpenRouter tidak dapat dihubungi, satu
  model cadangan dikembalikan agar chatbot tetap punya sesuatu untuk dicoba
  alih-alih gagal total.
*/
const getFreeModelsSafe = async (): Promise<FreeModel[]> => {
  try {
    const models = await getFreeModels()
    if (models.length > 0) return models
  } catch (error) {
    console.warn("[Chatbot] Daftar model OpenRouter gagal dimuat", error)
  }

  const pinned = process.env.OPENROUTER_MODEL?.trim() || PINNED_FALLBACK
  return [{ id: pinned, label: pinned, vision: false, created: 0 }]
}

/* Model gratis terbaru yang memang model chat umum, opsional yang bisa gambar. */
export const pickAutoModel = (
  models: FreeModel[],
  options: { vision?: boolean } = {}
): FreeModel | null => {
  const chat = models.filter(
    (model) => !NON_CHAT.test(model.id) && !NON_CHAT.test(model.label)
  )
  const pool = options.vision ? chat.filter((model) => model.vision) : chat

  return pool[0] ?? chat[0] ?? models[0] ?? null
}

/*
  Seluruh daftar ini sudah pasti gratis, jadi menuliskan "Gratis" di setiap
  baris tidak menambah informasi apa pun. Yang benar-benar membedakan antar
  model hanyalah kemampuan membaca gambar dan mana yang paling baru.
*/
const toAIModel = (model: FreeModel, index: number): AIModel => ({
  id: model.id,
  name: model.label,
  description: model.id,
  pros: model.vision ? ["Bisa baca gambar"] : [],
  free: true,
  vision: model.vision,
  recommended: index === 0,
})

/* Katalog untuk pemilih model di antarmuka. */
export const getChatModels = async (): Promise<AIModel[]> => {
  const models = await getFreeModelsSafe()
  return models.map(toAIModel)
}

export const getChatModelIds = async (): Promise<string[]> => {
  const models = await getFreeModelsSafe()
  return models.map((model) => model.id)
}

export const resolveRequestedModelId = async (
  messages: Message[],
  modelIndex?: number,
  preferredModelId?: string,
  options: { vision?: boolean } = {}
): Promise<string> => {
  const models = await getFreeModelsSafe()
  const modelIds = models.map((model) => model.id)

  if (preferredModelId && modelIds.includes(preferredModelId)) {
    return preferredModelId
  }

  if (
    typeof modelIndex === "number" &&
    Number.isInteger(modelIndex) &&
    modelIndex > 0 &&
    modelIds[modelIndex]
  ) {
    return modelIds[modelIndex]
  }

  if (options.vision) {
    const auto = pickAutoModel(models, { vision: true })
    if (auto) return auto.id
  }

  /*
    selectAutomaticModel memilih berdasarkan isi percakapan. Bila ia
    mengembalikan id yang tidak ada di daftar gratis saat ini, jatuh ke
    pilihan otomatis berbasis model terbaru.
  */
  const heuristic = selectAutomaticModel(messages, modelIds)
  if (modelIds.includes(heuristic)) return heuristic

  return pickAutoModel(models)?.id ?? modelIds[0]
}

/*
  Urutan percobaan dimulai dari model yang dipilih, lalu berputar ke model
  lain. Dibatasi agar satu permintaan tidak mencoba puluhan model dan
  membuat pengguna menunggu terlalu lama.
*/
const MAX_ATTEMPTS = 4

export const createModelAttemptOrder = async (startModelId: string): Promise<string[]> => {
  const modelIds = await getChatModelIds()
  const startIndex = Math.max(modelIds.indexOf(startModelId), 0)
  const rotated = [...modelIds.slice(startIndex), ...modelIds.slice(0, startIndex)]

  return rotated.slice(0, MAX_ATTEMPTS)
}

/* Model vision gratis terbaru, dipakai route gambar dan scan nota. */
export const getVisionModelId = async (): Promise<string> => {
  const models = await getFreeModelsSafe()
  const auto = pickAutoModel(models, { vision: true })

  if (!auto?.vision) {
    throw new Error(
      "Tidak ada model gratis yang mendukung gambar saat ini. Coba lagi nanti."
    )
  }

  return auto.id
}
