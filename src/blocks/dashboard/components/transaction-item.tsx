"use client"

import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import type { Transaction } from "@/types"
import { ArrowUpRight, ArrowDownRight, Trash2, Loader2 } from "lucide-react"
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
    if (!confirm("Hapus transaksi ini?")) return
    setIsDeleting(true)
    if (onDelete) {
      onDelete(transaction.id)
    }
  }

  return (
    <div className="flex items-center gap-4 py-4 px-1 group">
      {/* Icon */}
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          isIncome ? "bg-emerald-100" : "bg-red-100"
        )}
      >
        {isIncome ? (
          <ArrowUpRight className="h-5 w-5 text-emerald-600" />
        ) : (
          <ArrowDownRight className="h-5 w-5 text-red-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-neutral-900 text-sm truncate">{transaction.category}</p>
        <p className="text-xs text-neutral-500 mt-0.5 truncate">
          {formatShortDate(transaction.transaction_date)}
          {transaction.description && (
            <span className="text-neutral-400"> - {transaction.description}</span>
          )}
        </p>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={cn("font-semibold text-sm", isIncome ? "text-emerald-600" : "text-red-500")}>
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">
            {transaction.payment_method === "mbanking" ? "M-Banking" : "Cash"}
          </p>
        </div>

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-500 active:bg-red-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
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
