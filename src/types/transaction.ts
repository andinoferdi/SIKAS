export type TransactionType = "income" | "expense"
export type PaymentMethod = "mbanking" | "cash"

export interface Transaction {
  id: string
  user_id: string
  amount: number
  type: TransactionType
  category: string
  description: string | null
  payment_method: PaymentMethod
  transaction_date: string
  created_at: string
  updated_at: string
}

export interface CreateTransactionInput {
  amount: number
  type: TransactionType
  category: string
  description?: string
  payment_method: PaymentMethod
  transaction_date: string
}


export interface MonthlySummary {
  total_income: number
  total_expense: number
  net: number
}
