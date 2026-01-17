import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionService } from "@/services"
import type { CreateTransactionInput, UpdateTransactionInput } from "@/types"

interface GetTransactionsOptions {
  month?: string
  year?: string
  limit?: number
}

export function useTransactions(options?: GetTransactionsOptions) {
  return useQuery({
    queryKey: ["transactions", options],
    queryFn: () => transactionService.getTransactions(options),
  })
}

export function useSearchTransactions(query: string) {
  return useQuery({
    queryKey: ["transactions", "search", query],
    queryFn: () => transactionService.searchTransactions(query),
    enabled: query.trim().length >= 2,
  })
}

export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateTransactionInput) => transactionService.createTransaction(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["summary"] })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransactionInput }) =>
      transactionService.updateTransaction(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["summary"] })
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] })
      queryClient.invalidateQueries({ queryKey: ["summary"] })
    },
  })
}
