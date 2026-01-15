import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import { Transaction } from "@/types"

interface TransactionItemProps {
  transaction: Transaction
  onDelete?: (id: string) => void
}

export function TransactionItem({ transaction, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === "income"

  return (
    <div className="flex items-center justify-between py-3 border-b border-card-border last:border-0">
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isIncome
              ? "bg-success-bg dark:bg-success-bg-dark"
              : "bg-danger-bg dark:bg-danger-bg-dark"
          }`}
        >
          {isIncome ? (
            <svg
              className="w-5 h-5 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          )}
        </div>
        <div>
          <p className="font-medium text-text-primary text-sm">
            {transaction.category}
          </p>
          <p className="text-xs text-text-muted">
            {formatShortDate(transaction.transaction_date)}
            {transaction.description && ` · ${transaction.description}`}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <p
            className={`font-semibold text-sm ${
              isIncome
                ? "text-success"
                : "text-danger"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </p>
          <p className="text-xs text-text-muted">
            {transaction.payment_method === "mbanking" ? "M-Banking" : "Cash"}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(transaction.id)}
            className="p-1 text-icon-muted hover:text-danger transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
