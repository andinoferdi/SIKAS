export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
  imageUrl?: string
}

export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string
    }
  }>
}

export interface QuickReply {
  id: string
  text: string
  message: string
}

export interface AIModel {
  id: string
  name: string

  description: string
  pros: string[]
  free: boolean
  /* Model dapat menerima gambar sebagai masukan. */
  vision: boolean
  /* Pilihan otomatis saat ini, ditandai di pemilih model. */
  recommended: boolean
}

export interface ModelSelection {
  mode: "auto" | "manual"
  selectedModelId?: string
}
