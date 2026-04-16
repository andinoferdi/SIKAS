import type { PendingAction } from "@/components/chatbot/batch-action-confirmation"
import {
  extractCreateTransactionPayload,
  isActionlessSuccessReply,
  shouldUseCreateFallback,
} from "@/services/chatbot/intent-parser"
import { formatDraftTransactionSummary } from "@/services/chatbot/presentation"
import type { ActionPayload, ChatbotAction } from "@/types/rag"

type PendingActionPayload = ActionPayload & {
  transactionLabel?: string
  changeSummary?: string
  amount?: number
  type?: "income" | "expense"
  transactions?: Array<{ amount?: number; type?: string }>
  updates?: Array<Record<string, unknown>>
}

export function parseActions(
  content: string
): Array<{ action: ChatbotAction; payload: ActionPayload }> {
  const actions: Array<{ action: ChatbotAction; payload: ActionPayload }> = []
  const actionRegex = /\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/g
  let match: RegExpExecArray | null

  while ((match = actionRegex.exec(content)) !== null) {
    const actionType = match[1] as ChatbotAction

    try {
      const payload = JSON.parse(match[2].trim()) as ActionPayload
      actions.push({ action: actionType, payload })
    } catch (error) {
      console.error("Failed to parse action payload:", error)
    }
  }

  return actions
}

const getPendingActionDescription = (
  actionType: ChatbotAction,
  payload: PendingActionPayload
): string => {
  switch (actionType) {
    case "create_transaction":
      return payload.transactionLabel
        ? `Catat ${payload.transactionLabel}?`
        : `Tambah transaksi ${payload.type === "income" ? "pemasukan" : "pengeluaran"} Rp ${payload.amount?.toLocaleString("id-ID")}?`
    case "delete_transaction":
      return payload.transactionLabel
        ? `Hapus ${payload.transactionLabel}?`
        : "Hapus transaksi ini?"
    case "edit_transaction":
      if (payload.transactionLabel && payload.changeSummary) {
        return `Ubah ${payload.transactionLabel} menjadi ${payload.changeSummary}?`
      }

      return payload.transactionLabel
        ? `Ubah ${payload.transactionLabel}?`
        : "Ubah transaksi ini?"
    case "batch_create_transactions": {
      const txCount = payload.transactions?.length || 0
      const totalIncome =
        payload.transactions
          ?.filter((tx) => tx.type === "income")
          .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0
      const totalExpense =
        payload.transactions
          ?.filter((tx) => tx.type === "expense")
          .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

      let amountInfo = ""
      if (totalIncome > 0) amountInfo += `+Rp ${totalIncome.toLocaleString("id-ID")} `
      if (totalExpense > 0) amountInfo += `-Rp ${totalExpense.toLocaleString("id-ID")}`

      return amountInfo.trim()
        ? `Tambah ${txCount} transaksi (${amountInfo.trim()})?`
        : `Tambah ${txCount} transaksi sekaligus?`
    }
    case "batch_delete_transactions":
      return "Hapus transaksi yang sesuai filter?"
    case "batch_edit_transactions": {
      const editCount = payload.updates?.length || 0
      return `Edit ${editCount} transaksi sekaligus?`
    }
    case "delete_all_transactions":
      return "Hapus SEMUA transaksi? (Perlu konfirmasi tambahan)"
    default:
      return "Konfirmasi aksi ini?"
  }
}

export function parsePendingActions(content: string): PendingAction[] {
  const actions: PendingAction[] = []
  const pendingRegex = /\[PENDING_ACTION:(\w+)\]([\s\S]*?)\[\/PENDING_ACTION\]/g
  let match: RegExpExecArray | null

  while ((match = pendingRegex.exec(content)) !== null) {
    const actionType = match[1] as ChatbotAction

    try {
      const payload = JSON.parse(match[2].trim()) as PendingActionPayload
      actions.push({
        action: actionType,
        payload,
        description: getPendingActionDescription(actionType, payload),
      })
    } catch (error) {
      console.error("[Batch Debug] Failed to parse pending action payload:", error)
      console.error("[Batch Debug] Raw payload that failed:", match[2])
      actions.push({
        action: "parse_error",
        payload: { rawPayload: match[2].substring(0, 100) },
        description: "Gagal memproses aksi. Coba ulangi permintaan dengan format lebih sederhana.",
      })
    }
  }

  return actions
}

export function cleanContentForDisplay(content: string): string {
  return content
    .replace(/\[ACTION:[\w-]+\][\s\S]*?\[\/ACTION\]/gi, "")
    .replace(/\[PENDING_ACTION:[\w-]+\][\s\S]*?\[\/PENDING_ACTION\]/gi, "")
    .replace(/\[ACTION:[\w-]*(?:\][\s\S]*)?$/gi, "")
    .replace(/\[PENDING_ACTION:[\w-]*(?:\][\s\S]*)?$/gi, "")
    .replace(/\[\/ACTION\]/gi, "")
    .replace(/\[\/PENDING_ACTION\]/gi, "")
    .replace(/\[SEDIAKAN TAG PENDING_ACTION[^\]]*\]/gi, "")
    .replace(/\[SERTAKAN TAG PENDING_ACTION[^\]]*\]/gi, "")
    .replace(/\[PROVIDE PENDING_ACTION[^\]]*\]/gi, "")
    .replace(/\[[^\]]*PENDING_ACTION[^\]]*\]/gi, "")
    .replace(/\[[^\]]*ACTION[^\]]*TAG[^\]]*\]/gi, "")
    .replace(/Transaksi ID\s+[a-f0-9]{8}-[a-f0-9-]{27}/gi, "Transaksi")
    .replace(/\bID\s*:\s*(?:\[\])?\s*[a-f0-9]{8}-[a-f0-9-]{27}/gi, "")
    .replace(/\bID\s*:\s*(?:\[\])?/gi, "")
    .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export async function executeAction(
  action: ChatbotAction,
  payload: ActionPayload
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const response = await fetch("/api/chatbot/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.error || "Action failed" }
    }

    return { success: true, message: data.message || "Action completed", data }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function executeBatchAction(
  action: ChatbotAction,
  payload: ActionPayload
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const response = await fetch("/api/chatbot/batch-actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, message: data.error || "Batch action failed" }
    }

    return { success: true, message: data.message || "Batch action completed", data }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export function isBatchAction(action: ChatbotAction): boolean {
  return (
    action === "batch_create_transactions" ||
    action === "batch_delete_transactions" ||
    action === "batch_edit_transactions" ||
    action === "delete_all_transactions"
  )
}

export function extractTransactionFromText(
  content: string,
  today: string,
  userMessage?: string
): PendingAction | null {
  if (content.includes("[PENDING_ACTION:") || content.includes("[ACTION:")) {
    return null
  }

  if (userMessage && !shouldUseCreateFallback(userMessage, content)) {
    return null
  }

  const payload = extractCreateTransactionPayload(userMessage || content, today)
  if (!payload) {
    return null
  }

  return {
    action: "create_transaction",
    payload: {
      ...payload,
      transactionLabel: formatDraftTransactionSummary(payload),
    },
    description: `Catat ${formatDraftTransactionSummary(payload)}?`,
  }
}

export function shouldRejectAssistantSuccess(
  userMessage: string,
  assistantContent: string
): boolean {
  return isActionlessSuccessReply(userMessage, assistantContent)
}
