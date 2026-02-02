import type { Message } from "@/types/chatbot"

const getStorageKey = (userId: string) => `sikas-chat-${userId}`
const MAX_MESSAGES = 50

interface StoredMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  imageUrl?: string
}

export const saveChatHistory = (messages: Message[], userId: string | null): void => {
  if (typeof window === "undefined") return
  if (!userId) return // Don't save if not logged in

  try {
    const messagesToStore = messages
      .filter((m) => m.role !== "system")
      .slice(-MAX_MESSAGES)
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
        imageUrl: m.imageUrl,
      }))

    localStorage.setItem(getStorageKey(userId), JSON.stringify(messagesToStore))
  } catch (error) {
    console.warn("Failed to save chat history:", error)
  }
}

export const loadChatHistory = (userId: string | null): Message[] => {
  if (typeof window === "undefined") return []
  if (!userId) return [] // Don't load if not logged in

  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    if (!stored) return []

    const parsed: StoredMessage[] = JSON.parse(stored)
    return parsed.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.timestamp),
      imageUrl: m.imageUrl,
    }))
  } catch (error) {
    console.warn("Failed to load chat history:", error)
    return []
  }
}

export const clearChatHistory = (userId: string | null): void => {
  if (typeof window === "undefined") return
  if (!userId) return // Nothing to clear if not logged in

  try {
    localStorage.removeItem(getStorageKey(userId))
  } catch (error) {
    console.warn("Failed to clear chat history:", error)
  }
}

export const hasChatHistory = (userId: string | null): boolean => {
  if (typeof window === "undefined") return false
  if (!userId) return false // No history if not logged in

  try {
    const stored = localStorage.getItem(getStorageKey(userId))
    if (!stored) return false
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) && parsed.length > 0
  } catch {
    return false
  }
}
