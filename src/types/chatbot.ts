export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  isStreaming?: boolean
}

export interface ChatbotState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  isStreaming: boolean
}

export interface StreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    delta: {
      role?: string
      content?: string
    }
    finish_reason?: string
  }[]
}

export interface QuickReply {
  id: string
  text: string
  message: string
}
