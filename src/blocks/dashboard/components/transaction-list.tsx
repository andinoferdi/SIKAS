import type { Transaction } from "@/types"
import { TransactionItem } from "@/blocks/dashboard/components/transaction-item"
import { Receipt } from "lucide-react"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete?: (id: string) => void
  onEdit?: (transaction: Transaction) => void
  emptyMessage?: string
}

export function TransactionList({
  transactions,
  onDelete,
  onEdit,
  emptyMessage = "Belum ada transaksi",
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-4">
          <Receipt className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-foreground text-sm font-medium">{emptyMessage}</p>
        <p className="text-muted-foreground text-sm mt-1">Mulai dengan menambah transaksi baru</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}
