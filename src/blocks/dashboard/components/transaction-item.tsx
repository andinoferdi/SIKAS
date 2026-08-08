"use client"

import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import type { Transaction } from "@/types"
import { ArrowUpRight, ArrowDownRight, Trash2, Loader2, Pencil } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ConfirmDialog } from "@/components/ui"

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
}

export function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
  const isIncome = transaction.type === "income"
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    setIsDeleting(true)
    setConfirmOpen(false)
    onDelete?.(transaction.id)
  }

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          isIncome ? "bg-success-bg" : "bg-danger-bg",
        )}
      >
        {isIncome ? (
          <ArrowUpRight className="h-5 w-5 text-success" />
        ) : (
          <ArrowDownRight className="h-5 w-5 text-danger" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{transaction.category}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {formatShortDate(transaction.transaction_date)}
          {transaction.description && <span> - {transaction.description}</span>}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            isIncome ? "text-success" : "text-danger",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {transaction.payment_method === "mbanking" ? "M-Banking" : "Cash"}
        </p>
      </div>

      {(onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(transaction)}
              aria-label={`Edit transaksi ${transaction.category}`}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 active:bg-primary/10"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={isDeleting}
              aria-label={`Hapus transaksi ${transaction.category}`}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-danger transition-colors hover:bg-danger-bg active:bg-danger-bg disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Hapus transaksi ini?"
        description={`${transaction.category} sebesar ${formatCurrency(transaction.amount)} akan dihapus permanen dan saldo dikembalikan.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
