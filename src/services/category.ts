import { fetcher } from "@/services/base"
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoriesResponse,
  CategoryResponse,
} from "@/types/category"
import type { TransactionType } from "@/types"

export const categoryService = {
  async getCategories(type?: TransactionType): Promise<Category[]> {
    const url = type ? `/api/categories?type=${type}` : "/api/categories"
    const data = await fetcher<CategoriesResponse>(url)
    return data.categories || []
  },

  async getCategoryById(id: string): Promise<Category> {
    const data = await fetcher<CategoryResponse>(`/api/categories/${id}`)
    return data.category
  },

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const data = await fetcher<CategoryResponse>("/api/categories", {
      method: "POST",
      body: JSON.stringify(input),
    })
    return data.category
  },

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const data = await fetcher<CategoryResponse>(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    })
    return data.category
  },

  async deleteCategory(id: string): Promise<void> {
    await fetcher<{ success: boolean }>(`/api/categories/${id}`, { method: "DELETE" })
  },
}
