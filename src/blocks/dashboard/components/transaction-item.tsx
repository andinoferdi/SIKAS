"use client"

import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import type { Transaction } from "@/types"
import { TrendingUp, TrendingDown, Trash2 } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: (id: string) => void
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "income"
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    if (onDelete) {
      onDelete(transaction.id)
    }
  }

  return (
    <div className="flex items-center justify-between py-4 px-3 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors duration-200 rounded-lg -mx-2">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border",
            isIncome ? "bg-success-bg border-success-border" : "bg-danger-bg border-danger-border",
          )}
        >
          {isIncome ? (
            <TrendingUp className="h-5 w-5 text-success" />
          ) : (
            <TrendingDown className="h-5 w-5 text-danger" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground text-sm">{transaction.category}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatShortDate(transaction.transaction_date)}
            {transaction.description && ` • ${transaction.description}`}
          </p>
        </div>
      </div>

      {/* Amount & Delete */}
      <div className="flex items-center gap-3">
        <div className="text-right shrink-0">
          <p className={cn("font-semibold text-sm", isIncome ? "text-success" : "text-danger")}>
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            {transaction.payment_method === "mbanking" ? "M-Banking" : "Cash"}
          </p>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-muted-foreground hover:text-danger hover:bg-danger-bg rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            title="Hapus transaksi"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
