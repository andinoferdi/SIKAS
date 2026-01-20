// Re-export from new modular structure
// This file maintains backwards compatibility

export {
  MODELS,
  MODEL_DISPLAY_NAMES,
  ALL_MODELS,
  QUICK_REPLIES,
  BASE_SYSTEM_PROMPT,
  createSystemPrompt,
  parseStreamResponse,
  sendChatMessage,
  handleModelFallback,
  generateMessageId,
  getGreetingMessage,
} from "./chatbot/core"

export {
  retrieveContext,
  isContextUseful,
  ragService,
} from "./chatbot/rag"

export {
  knowledgeData,
  getKnowledgeCount,
} from "./chatbot/knowledge-seed"

