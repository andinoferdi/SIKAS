import { Transaction } from "@/types"
import { TransactionItem } from "@/blocks/dashboard/components/transaction-item"

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
      <div className="text-center py-8">
        <svg
          className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <p className="text-text-muted text-sm">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
