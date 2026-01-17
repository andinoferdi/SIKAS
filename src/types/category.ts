import { TransactionType } from "@/types/transaction"

export interface Category {
  id: string
  name: string
  type: TransactionType
  created_at: string
}

export interface CreateCategoryInput {
  name: string
  type: TransactionType
}

export interface UpdateCategoryInput {
  name?: string
  type?: TransactionType
}

export interface CategoriesResponse {
  categories: Category[]
}

export interface CategoryResponse {
  category: Category
}
