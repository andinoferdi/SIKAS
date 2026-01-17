import { useQuery } from "@tanstack/react-query"
import { categoryService } from "@/services"
import type { TransactionType } from "@/types"

export function useCategories(type?: TransactionType) {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: () => categoryService.getCategories(type),
  })
}
