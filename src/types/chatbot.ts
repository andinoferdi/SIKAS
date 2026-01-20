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
  supportsVision: boolean
  category: "text" | "vision"
  pros: string[]
  free: boolean
}

export interface ModelSelection {
  mode: "auto" | "manual"
  selectedModelId?: string
}
