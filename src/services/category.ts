import { Category, CreateCategoryInput, UpdateCategoryInput } from "@/types/category"
import { TransactionType } from "@/types"

interface CategoriesResponse {
  categories?: Category[]
  error?: string
}

interface CategoryResponse {
  category?: Category
  error?: string
}

export const categoryService = {
  async getCategories(type?: TransactionType): Promise<Category[]> {
    try {
      const url = type ? `/api/categories?type=${type}` : "/api/categories"
      const res = await fetch(url)
      const data: CategoriesResponse = await res.json()
      return data.categories || []
    } catch {
      return []
    }
  },

  async getCategoryById(id: string): Promise<Category | null> {
    try {
      const res = await fetch(`/api/categories/${id}`)
      const data: CategoryResponse = await res.json()
      return data.category || null
    } catch {
      return null
    }
  },

  async createCategory(input: CreateCategoryInput): Promise<CategoryResponse> {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || "Gagal membuat kategori" }
      }
      return { category: data.category }
    } catch {
      return { error: "Terjadi kesalahan" }
    }
  },

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<CategoryResponse> {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || "Gagal mengupdate kategori" }
      }
      return { category: data.category }
    } catch {
      return { error: "Terjadi kesalahan" }
    }
  },

  async deleteCategory(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      return res.ok
    } catch {
      return false
    }
  },
}
