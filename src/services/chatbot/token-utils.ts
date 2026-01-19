import type { Message } from "@/types/chatbot"

export const CHATBOT_CONFIG = {
  MAX_CONTEXT_TOKENS: 8000,
  RESERVED_FOR_RESPONSE: 1500,
  MAX_HISTORY_MESSAGES: 10,
  KEEP_FIRST_MESSAGE: true,
  CHARS_PER_TOKEN: 4,
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHATBOT_CONFIG.CHARS_PER_TOKEN)
}

export function estimateMessagesTokens(messages: Message[]): number {
  return messages.reduce((sum, msg) => {
    return sum + estimateTokens(msg.content) + 4
  }, 0)
}

export function pruneConversationHistory(
  messages: Message[],
  maxMessages: number = CHATBOT_CONFIG.MAX_HISTORY_MESSAGES
): Message[] {
  const nonSystemMessages = messages.filter((m) => m.role !== "system")

  if (nonSystemMessages.length <= maxMessages) {
    return nonSystemMessages
  }

  if (CHATBOT_CONFIG.KEEP_FIRST_MESSAGE && nonSystemMessages.length > 0) {
    const firstMessage = nonSystemMessages[0]
    const recentMessages = nonSystemMessages.slice(-(maxMessages - 1))
    return [firstMessage, ...recentMessages]
  }

  return nonSystemMessages.slice(-maxMessages)
}
