import type { ChatbotAction, ActionPayload } from "@/types/rag"
import type { PendingAction } from "@/components/chatbot/batch-action-confirmation"

export function parseActions(
  content: string
): Array<{ action: ChatbotAction; payload: ActionPayload }> {
  const actions: Array<{ action: ChatbotAction; payload: ActionPayload }> = []
  const actionRegex = /\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/g
  let match

  while ((match = actionRegex.exec(content)) !== null) {
    const actionType = match[1] as ChatbotAction
    try {
      const payload = JSON.parse(match[2].trim())
      actions.push({ action: actionType, payload })
    } catch (e) {
      console.error("Failed to parse action payload:", e)
    }
  }

  return actions
}

export function parsePendingActions(content: string): PendingAction[] {
  const actions: PendingAction[] = []
  const pendingRegex = /\[PENDING_ACTION:(\w+)\]([\s\S]*?)\[\/PENDING_ACTION\]/g
  let match

  while ((match = pendingRegex.exec(content)) !== null) {
    const actionType = match[1] as ChatbotAction
    try {
      const payload = JSON.parse(match[2].trim())
      let description = "Konfirmasi aksi ini?"

      switch (actionType) {
        case "create_transaction":
          description = `Tambah transaksi ${payload.type === "income" ? "pemasukan" : "pengeluaran"} Rp ${payload.amount?.toLocaleString("id-ID")}?`
          break
        case "delete_transaction":
          description = "Hapus transaksi ini?"
          break
        case "edit_transaction":
          description = "Ubah transaksi ini?"
          break
        case "batch_create_transactions":
          const txCount = payload.transactions?.length || 0
          const totalIncome = payload.transactions
            ?.filter((tx: { type: string }) => tx.type === "income")
            .reduce((sum: number, tx: { amount?: number }) => sum + (tx.amount || 0), 0) || 0
          const totalExpense = payload.transactions
            ?.filter((tx: { type: string }) => tx.type === "expense")
            .reduce((sum: number, tx: { amount?: number }) => sum + (tx.amount || 0), 0) || 0
          let amountInfo = ""
          if (totalIncome > 0) amountInfo += `+Rp ${totalIncome.toLocaleString("id-ID")} `
          if (totalExpense > 0) amountInfo += `-Rp ${totalExpense.toLocaleString("id-ID")}`
          description = amountInfo.trim()
            ? `Tambah ${txCount} transaksi (${amountInfo.trim()})?`
            : `Tambah ${txCount} transaksi sekaligus?`
          break
        case "batch_delete_transactions":
          description = "Hapus transaksi yang sesuai filter?"
          break
        case "batch_edit_transactions":
          const editCount = payload.updates?.length || 0
          description = `Edit ${editCount} transaksi sekaligus?`
          break
        case "delete_all_transactions":
          description = "Hapus SEMUA transaksi? (Perlu konfirmasi tambahan)"
          break
      }

      actions.push({ action: actionType, payload, description })
    } catch (e) {
      console.error("[Batch Debug] Failed to parse pending action payload:", e)
      console.error("[Batch Debug] Raw payload that failed:", match[2])
      actions.push({
        action: "parse_error",
        payload: { rawPayload: match[2].substring(0, 100) },
        description: "Gagal memproses aksi. Coba ulangi permintaan dengan format lebih sederhana."
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
    .replace(/Transaksi ID\s+[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "Transaksi")
    .replace(/ID\s+[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, "")
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
  return action === "batch_create_transactions" ||
         action === "batch_delete_transactions" ||
         action === "batch_edit_transactions" ||
         action === "delete_all_transactions"
}
