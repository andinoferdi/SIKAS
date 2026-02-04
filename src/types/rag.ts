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

export type ChatbotAction =
  | "create_transaction"
  | "delete_transaction"
  | "edit_transaction"
  | "search_transactions"
  | "batch_create_transactions"
  | "batch_delete_transactions"
  | "batch_edit_transactions"
  | "delete_all_transactions"
  | "parse_error"

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

export interface EditTransactionPayload {
  transactionId: string
  updates: {
    amount?: number
    type?: "income" | "expense"
    category?: string
    description?: string
    payment_method?: "mbanking" | "cash"
    transaction_date?: string
  }
}

export interface SearchTransactionsPayload {
  category?: string
  type?: "income" | "expense"
  startDate?: string
  endDate?: string
  description?: string
}

export interface BatchCreateTransactionsPayload {
  transactions: CreateTransactionPayload[]
}

export interface BatchDeleteTransactionsPayload {
  filter: {
    category?: string
    type?: "income" | "expense"
    startDate?: string
    endDate?: string
    payment_method?: "mbanking" | "cash"
  }
}

export interface DeleteAllTransactionsPayload {
  confirmationText: string
  month?: number
  year?: number
}

export interface BatchEditTransactionsPayload {
  updates: Array<{
    transactionId: string
    updates: {
      amount?: number
      type?: "income" | "expense"
      category?: string
      description?: string
      payment_method?: "mbanking" | "cash"
      transaction_date?: string
    }
  }>
}

export interface BatchActionResult {
  success: boolean
  totalRequested: number
  totalSucceeded: number
  totalFailed: number
  totalBalanceChange: {
    mbanking: number
    cash: number
  }
  results: Array<{
    index: number
    success: boolean
    message?: string
    transactionId?: string
  }>
}

export interface ParseErrorPayload {
  rawPayload?: string
}

export type ActionPayload =
  | CreateTransactionPayload
  | DeleteTransactionPayload
  | EditTransactionPayload
  | SearchTransactionsPayload
  | BatchCreateTransactionsPayload
  | BatchDeleteTransactionsPayload
  | BatchEditTransactionsPayload
  | DeleteAllTransactionsPayload
  | ParseErrorPayload

export interface ChatbotActionRequest {
  action: ChatbotAction
  payload: ActionPayload
}
