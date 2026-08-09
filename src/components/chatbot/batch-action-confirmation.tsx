"use client"

import { useState, useMemo, useRef } from "react"
import { Check, XCircle, AlertTriangle, Trash2, Plus, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ChatbotAction, CreateTransactionPayload, ActionPayload } from "@/types/rag"
import { useLenisPanel } from "@/components/scroll"

export interface PendingAction {
  action: ChatbotAction
  payload: ActionPayload
  description: string
}

interface BatchActionConfirmationProps {
  actions: PendingAction[]
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function BatchActionConfirmation({
  actions,
  onConfirm,
  onCancel,
  isLoading = false,
}: BatchActionConfirmationProps) {
  const [confirmationText, setConfirmationText] = useState("")
  const createListRef = useRef<HTMLDivElement>(null)
  const editListRef = useRef<HTMLDivElement>(null)

  // Kedua daftar mount bersyarat sesuai jenis aksi batch-nya.
  useLenisPanel(createListRef, [actions])
  useLenisPanel(editListRef, [actions])

  const isBatchAction = actions.length === 1 && (
    actions[0].action === "batch_create_transactions" ||
    actions[0].action === "batch_delete_transactions" ||
    actions[0].action === "batch_edit_transactions" ||
    actions[0].action === "delete_all_transactions"
  )

  const isDeleteAll = actions.length === 1 && actions[0].action === "delete_all_transactions"
  const isDestructive = actions.some(a =>
    a.action.includes("delete")
  )

  const canConfirm = useMemo(() => {
    if (isDeleteAll) {
      return confirmationText === "HAPUS SEMUA"
    }
    return true
  }, [isDeleteAll, confirmationText])

  const batchDetails = useMemo(() => {
    if (!isBatchAction) return null

    const action = actions[0]
    if (action.action === "batch_create_transactions") {
      const payload = action.payload as { transactions: CreateTransactionPayload[] }
      const transactions = payload.transactions || []
      const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)
      return {
        type: "create",
        count: transactions.length,
        totalAmount,
        items: transactions.map((tx, i) => ({
          id: i,
          label: `${tx.category}: Rp ${tx.amount.toLocaleString("id-ID")}`,
          detail: tx.description || tx.type,
        })),
      }
    }

    if (action.action === "batch_delete_transactions") {
      const payload = action.payload as { filter: Record<string, string> }
      const filters: string[] = []
      if (payload.filter?.category) filters.push(`Kategori: ${payload.filter.category}`)
      if (payload.filter?.type) filters.push(`Tipe: ${payload.filter.type === "income" ? "Pemasukan" : "Pengeluaran"}`)
      if (payload.filter?.startDate) filters.push(`Dari: ${payload.filter.startDate}`)
      if (payload.filter?.endDate) filters.push(`Sampai: ${payload.filter.endDate}`)
      if (payload.filter?.payment_method) filters.push(`Metode: ${payload.filter.payment_method === "mbanking" ? "M-Banking" : "Cash"}`)

      return {
        type: "delete_filter",
        filters,
      }
    }

    if (action.action === "batch_edit_transactions") {
      const payload = action.payload as { updates: Array<{ transactionId: string; updates: Record<string, unknown> }> }
      const updates = payload.updates || []
      return {
        type: "edit",
        count: updates.length,
        items: updates.map((u, i) => ({
          id: i,
          label: `Transaksi ${i + 1}`,
          detail: Object.keys(u.updates).join(", "),
        })),
      }
    }

    if (action.action === "delete_all_transactions") {
      const payload = action.payload as { month?: number; year?: number }
      const scope = payload.month && payload.year
        ? `bulan ${payload.month}/${payload.year}`
        : "SEMUA WAKTU"
      return {
        type: "delete_all",
        scope,
      }
    }

    return null
  }, [isBatchAction, actions])

  return (
    <div
      className={cn(
        "rounded-lg p-3 mx-1",
        isDestructive ? "bg-destructive/10 border border-destructive/30" : "bg-muted/50"
      )}
    >
      <div className="flex items-start gap-2 mb-3">
        {isDestructive ? (
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        ) : (
          <Plus className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        )}
        <div>
          <p className={cn(
            "text-sm font-medium",
            isDestructive ? "text-destructive" : "text-foreground"
          )}>
            {isDeleteAll
              ? "Hapus Semua Transaksi"
              : batchDetails?.type === "create"
                ? `Tambah ${batchDetails.count} Transaksi`
                : batchDetails?.type === "edit"
                  ? `Edit ${batchDetails.count} Transaksi`
                  : batchDetails?.type === "delete_filter"
                    ? "Hapus Transaksi (Filter)"
                    : actions[0]?.description || "Konfirmasi Aksi"}
          </p>
        </div>
      </div>

      {batchDetails?.type === "create" && batchDetails.items && (
        <div ref={createListRef} className="mb-3 space-y-1 max-h-32 overflow-y-auto">
          {batchDetails.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 text-sm py-1 px-2 bg-background/50 rounded"
            >
              <Plus className="w-3 h-3 text-primary" />
              <span className="font-medium">{item.label}</span>
              {item.detail && (
                <span className="text-muted-foreground">({item.detail})</span>
              )}
            </div>
          ))}
          <div className="pt-2 border-t border-border mt-2">
            <p className="text-sm font-medium">
              Total: Rp {batchDetails.totalAmount?.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}

      {batchDetails?.type === "edit" && batchDetails.items && (
        <div ref={editListRef} className="mb-3 space-y-1 max-h-32 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-2">
            Transaksi yang akan diubah:
          </p>
          {batchDetails.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 text-sm py-1 px-2 bg-background/50 rounded"
            >
              <Pencil className="w-3 h-3 text-primary" />
              <span className="font-medium">{item.label}</span>
              {item.detail && (
                <span className="text-muted-foreground">({item.detail})</span>
              )}
            </div>
          ))}
        </div>
      )}

      {batchDetails?.type === "delete_filter" && batchDetails.filters && (
        <div className="mb-3 space-y-1">
          <p className="text-sm text-muted-foreground mb-2">
            Transaksi yang sesuai filter akan dihapus:
          </p>
          {batchDetails.filters.map((filter, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-sm py-1 px-2 bg-background/50 rounded"
            >
              <Trash2 className="w-3 h-3 text-destructive" />
              <span>{filter}</span>
            </div>
          ))}
        </div>
      )}

      {batchDetails?.type === "delete_all" && (
        <div className="mb-3">
          <div className="bg-destructive/20 rounded-md p-3 mb-3">
            <p className="text-sm text-destructive font-medium mb-1">
              Peringatan: Aksi ini tidak dapat dibatalkan!
            </p>
            <p className="text-sm text-destructive/80">
              Semua transaksi {batchDetails.scope} akan dihapus permanen.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Ketik <span className="font-mono font-bold">HAPUS SEMUA</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className={cn(
                "h-11 w-full rounded-lg border bg-input px-4 text-base",
                confirmationText === "HAPUS SEMUA"
                  ? "border-destructive"
                  : "border-input"
              )}
              placeholder="HAPUS SEMUA"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {!isBatchAction && (
        <p className="text-sm text-foreground mb-3">
          {actions[0]?.description}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={!canConfirm || isLoading}
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
            isDestructive
              ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              : "bg-primary text-primary-foreground hover:bg-btn-primary-hover disabled:opacity-50",
            (!canConfirm || isLoading) && "cursor-not-allowed"
          )}
        >
          {isDestructive ? (
            <Trash2 className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          {isLoading
            ? "Memproses..."
            : isDestructive
              ? "Ya, Hapus"
              : "Ya, Lanjutkan"}
        </button>
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Batal
        </button>
      </div>
    </div>
  )
}
