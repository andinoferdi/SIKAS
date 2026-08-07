"use client"

import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import type { Transaction } from "@/types"
import { ArrowUpRight, ArrowDownRight, Trash2, Loader2, Pencil } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
}

export function TransactionItem({ transaction, onDelete, onEdit }: TransactionItemProps) {
  const isIncome = transaction.type === "income"
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Hapus transaksi ini?")) return
    setIsDeleting(true)
    if (onDelete) {
      onDelete(transaction.id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(transaction)
    }
  }

  return (
    <div className="flex items-center gap-4 py-4 px-1 group">
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          isIncome ? "bg-success-bg" : "bg-danger-bg"
        )}
      >
        {isIncome ? (
          <ArrowUpRight className="h-5 w-5 text-success" />
        ) : (
          <ArrowDownRight className="h-5 w-5 text-danger" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground text-sm truncate">{transaction.category}</p>
        <p className="text-sm text-muted-foreground mt-0.5 truncate">
          {formatShortDate(transaction.transaction_date)}
          {transaction.description && (
            <span className="text-muted-foreground/70"> - {transaction.description}</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <p className={cn("font-semibold text-sm", isIncome ? "text-success" : "text-danger")}>
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            {transaction.payment_method === "mbanking" ? "M-Banking" : "Cash"}
          </p>
        </div>

 
        {onEdit && (
          <button
            onClick={handleEdit}
            className="p-2 text-primary active:bg-primary/10 rounded-lg transition-colors"
            title="Edit transaksi"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}


        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-danger active:bg-danger-bg rounded-lg transition-colors disabled:opacity-50"
            title="Hapus transaksi"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
