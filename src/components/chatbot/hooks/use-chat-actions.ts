"use client"

import { useState, useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { type Message } from "@/types/chatbot"
import { generateMessageId } from "@/services/chatbot"
import { executeAction, executeBatchAction, isBatchAction } from "@/components/chatbot/utils/action-parser"
import type { PendingAction } from "@/components/chatbot/batch-action-confirmation"

interface UseChatActionsOptions {
  onAddMessage: (message: Message) => void
}

export function useChatActions({ onAddMessage }: UseChatActionsOptions) {
  const queryClient = useQueryClient()
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] })
    queryClient.invalidateQueries({ queryKey: ["summary"] })
    queryClient.invalidateQueries({ queryKey: ["user", "current"] })
  }, [queryClient])

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return

    setIsExecuting(true)

    const result = isBatchAction(pendingAction.action)
      ? await executeBatchAction(pendingAction.action, pendingAction.payload)
      : await executeAction(pendingAction.action, pendingAction.payload)

    if (result.success) {
      invalidateQueries()
      onAddMessage({
        id: generateMessageId(),
        role: "assistant",
        content: `✅ ${result.message}`,
        timestamp: new Date(),
      })
    } else {
      onAddMessage({
        id: generateMessageId(),
        role: "assistant",
        content: `❌ ${result.message}`,
        timestamp: new Date(),
      })
    }

    setPendingAction(null)
    setIsExecuting(false)
  }, [pendingAction, invalidateQueries, onAddMessage])

  const handleCancelAction = useCallback(() => {
    onAddMessage({
      id: generateMessageId(),
      role: "assistant",
      content: "Baik, aksi dibatalkan.",
      timestamp: new Date(),
    })
    setPendingAction(null)
  }, [onAddMessage])

  const setPending = useCallback((action: PendingAction | null) => {
    setPendingAction(action)
  }, [])

  return {
    pendingAction,
    isExecuting,
    setPendingAction: setPending,
    handleConfirmAction,
    handleCancelAction,
    invalidateQueries,
  }
}
