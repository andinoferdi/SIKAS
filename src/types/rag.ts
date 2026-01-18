import type { Transaction, MonthlySummary } from "@/types/transaction"

export type KnowledgeCategory = "features" | "faq" | "tutorial" | "rules"

export interface KnowledgeEntry {
  id: string
  content: string
  category: KnowledgeCategory
  metadata: Record<string, unknown>
  embedding?: number[]
  created_at: string
  updated_at: string
}

export interface SearchResult {
  id: string
  content: string
  category: string
  similarity: number
}

export interface RAGContext {
  query: string
  relevantDocs: SearchResult[]
  avgSimilarity: number
}

export interface KnowledgeSeedEntry {
  content: string
  category: KnowledgeCategory
  metadata?: Record<string, unknown>
}

// User context types for chatbot
export interface CategorySummary {
  category: string
  total: number
  count: number
}

export interface AllTimeSummary {
  totalIncome: number
  totalExpense: number
  byCategory: CategorySummary[]
}

export interface UserChatContext {
  userId: string
  userName: string
  balances: {
    mbanking: number
    cash: number
  }
  allTimeSummary: AllTimeSummary
  monthlySummary: MonthlySummary & {
    month: number
    year: number
  }
  recentTransactions: Transaction[]
}

export interface EnhancedRAGContext extends RAGContext {
  userContext?: UserChatContext
  formattedUserContext?: string
}

// Action types for chatbot
export type ChatbotAction = "create_transaction" | "delete_transaction" | "search_transactions"

export interface CreateTransactionPayload {
  amount: number
  type: "income" | "expense"
  category: string
  description?: string
  payment_method: "mbanking" | "cash"
  transaction_date: string
}

export interface DeleteTransactionPayload {
  transactionId: string
}

export interface SearchTransactionsPayload {
  category?: string
  type?: "income" | "expense"
  startDate?: string
  endDate?: string
  description?: string
}

export type ActionPayload = CreateTransactionPayload | DeleteTransactionPayload | SearchTransactionsPayload

export interface ChatbotActionRequest {
  action: ChatbotAction
  payload: ActionPayload
}
