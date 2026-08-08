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
      <div className="py-10 text-center">
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
          <Receipt className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{emptyMessage}</p>
        <p className="mt-1 text-sm text-muted-foreground">Mulai dengan menambah transaksi baru</p>
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
