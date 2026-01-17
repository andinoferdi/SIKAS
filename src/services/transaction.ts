import { fetcher } from "@/services/base"
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  GetTransactionsOptions,
  TransactionsResponse,
  TransactionResponse,
} from "@/types"

export const transactionService = {
  async getTransactions(options: GetTransactionsOptions = {}): Promise<Transaction[]> {
    const params = new URLSearchParams()
    if (options.month) params.set("month", options.month)
    if (options.year) params.set("year", options.year)
    if (options.limit) params.set("limit", String(options.limit))

    const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ""}`
    const data = await fetcher<TransactionsResponse>(url)
    return data.transactions || []
  },

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    const data = await fetcher<TransactionResponse>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(input),
    })
    return data.transaction
  },

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    const data = await fetcher<TransactionResponse>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })
    return data.transaction
  },

  async deleteTransaction(id: string): Promise<void> {
    await fetcher<{ success: boolean }>(`/api/transactions/${id}`, { method: "DELETE" })
  },

  async searchTransactions(query: string): Promise<Transaction[]> {
    if (!query || query.trim().length < 2) return []
    const data = await fetcher<TransactionsResponse>(`/api/transactions/search?q=${encodeURIComponent(query)}`)
    return data.transactions || []
  },
}
