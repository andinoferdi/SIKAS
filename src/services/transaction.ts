import { Transaction, CreateTransactionInput, UpdateTransactionInput } from "@/types"

interface GetTransactionsOptions {
  month?: string
  year?: string
  limit?: number
}

interface TransactionsResponse {
  transactions?: Transaction[]
  error?: string
}

interface TransactionResponse {
  transaction?: Transaction
  error?: string
}

export const transactionService = {
  async getTransactions(options: GetTransactionsOptions = {}): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams()
      if (options.month) params.set("month", options.month)
      if (options.year) params.set("year", options.year)
      if (options.limit) params.set("limit", String(options.limit))

      const url = `/api/transactions${params.toString() ? `?${params.toString()}` : ""}`
      const res = await fetch(url)
      const data: TransactionsResponse = await res.json()
      return data.transactions || []
    } catch {
      return []
    }
  },

  async createTransaction(input: CreateTransactionInput): Promise<TransactionResponse> {
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || "Gagal menyimpan transaksi" }
      }
      return { transaction: data.transaction }
    } catch {
      return { error: "Terjadi kesalahan" }
    }
  },

  async deleteTransaction(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      return res.ok
    } catch {
      return false
    }
  },

  async searchTransactions(query: string): Promise<Transaction[]> {
    try {
      if (!query || query.trim().length < 2) return []
      const res = await fetch(`/api/transactions/search?q=${encodeURIComponent(query)}`)
      const data: TransactionsResponse = await res.json()
      return data.transactions || []
    } catch {
      return []
    }
  },

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<TransactionResponse> {
    try {
      const res = await fetch(`/api/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || "Gagal memperbarui transaksi" }
      }
      return { transaction: data.transaction }
    } catch {
      return { error: "Terjadi kesalahan" }
    }
  },
}
