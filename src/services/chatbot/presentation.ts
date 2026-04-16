import type { Transaction, TransactionType, PaymentMethod } from "@/types/transaction"
import type { CreateTransactionPayload } from "@/types/rag"
import { formatCurrency, formatShortDate } from "@/lib/utils/format"

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  mbanking: "M-Banking",
}

const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "pemasukan",
  expense: "pengeluaran",
}

type TransactionLike = Pick<
  Transaction,
  "amount" | "type" | "category" | "payment_method" | "transaction_date" | "description"
>

export function formatAmount(amount: number): string {
  return formatCurrency(Number(amount))
}

export function getPaymentMethodLabel(paymentMethod: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[paymentMethod]
}

export function getTransactionTypeLabel(type: TransactionType): string {
  return TRANSACTION_TYPE_LABELS[type]
}

export function formatBalanceSentence(label: string, amount: number): string {
  if (amount === 0) {
    return `${label} kamu saat ini Rp 0 (nol rupiah).`
  }

  return `${label} kamu saat ini ${formatAmount(amount)}.`
}

export function formatTransactionSummary(transaction: TransactionLike): string {
  const description =
    transaction.description && transaction.description !== transaction.category
      ? ` (${transaction.description})`
      : ""

  return `${getTransactionTypeLabel(transaction.type)} ${transaction.category} ${formatAmount(
    Number(transaction.amount)
  )} tanggal ${formatShortDate(transaction.transaction_date)} via ${getPaymentMethodLabel(
    transaction.payment_method
  )}${description}`
}

export function formatDraftTransactionSummary(payload: CreateTransactionPayload): string {
  return formatTransactionSummary({
    ...payload,
    description: payload.description || null,
  })
}

