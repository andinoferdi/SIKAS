import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { transactionService } from "@/services"
import { broadcastInvalidation } from "@/lib/utils/broadcast-sync"
import type { CreateTransactionInput, UpdateTransactionInput, GetTransactionsOptions } from "@/types"

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
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
      broadcastInvalidation([["transactions"], ["summary"], ["user", "current"]])
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
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
      broadcastInvalidation([["transactions"], ["summary"], ["user", "current"]])
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
      queryClient.invalidateQueries({ queryKey: ["user", "current"] })
      broadcastInvalidation([["transactions"], ["summary"], ["user", "current"]])
    },
  })
}
