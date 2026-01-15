export interface User {
  id: string
  name: string
  pin_hash: string | null
  mbanking_balance: number
  cash_balance: number
  created_at: string
  updated_at: string
}

export interface SessionUser {
  id: string
  name: string
}
