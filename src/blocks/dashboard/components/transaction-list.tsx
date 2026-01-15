import type { Transaction } from "@/types"
import { TransactionItem } from "@/blocks/dashboard/components/transaction-item"
import { List } from "lucide-react"

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
      <div className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-neutral-100 rounded-lg">
            <List className="w-8 h-8 text-neutral-400" />
          </div>
        </div>
        <p className="text-neutral-600 text-sm font-medium">{emptyMessage}</p>
        <p className="text-neutral-500 text-xs mt-2">Mulai dengan menambah transaksi baru</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} onDelete={onDelete} />
      ))}
    </div>
  )
}
