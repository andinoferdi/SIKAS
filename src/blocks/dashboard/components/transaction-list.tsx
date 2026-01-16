import type { Transaction } from "@/types"
import { TransactionItem } from "@/blocks/dashboard/components/transaction-item"
import { Receipt } from "lucide-react"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete?: (id: string) => void
  emptyMessage?: string
}

export function TransactionList({
  transactions,
  onDelete,
  emptyMessage = "Belum ada transaksi",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-100 mb-4">
          <Receipt className="w-7 h-7 text-neutral-400" />
        </div>
        <p className="text-neutral-700 text-sm font-medium">{emptyMessage}</p>
        <p className="text-neutral-500 text-xs mt-1">Mulai dengan menambah transaksi baru</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-neutral-100">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} />
      ))}
    </div>
  )
}
