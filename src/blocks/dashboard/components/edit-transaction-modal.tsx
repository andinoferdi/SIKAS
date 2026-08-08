"use client"

import { toast } from "sonner"
import { Button } from "@/components/ui"
import type { Transaction } from "@/types"
import { useUpdateTransaction } from "@/hooks"
import { Loader2, X } from "lucide-react"
import { useTransactionForm } from "@/blocks/dashboard/components/hooks/use-transaction-form"
import { TransactionFormFields } from "@/blocks/dashboard/components/transaction-form-fields"

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSuccess: () => void
}

export function EditTransactionModal({ transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const updateMutation = useUpdateTransaction()

  const {
    form,
    type,
    paymentMethod,
    category,
    categories,
    balanceWarning,
    handleAmountChange,
    handleTypeChange,
    handleCategoryChange,
    handlePaymentMethodChange,
    handleDateChange,
    validateAndGetAmount,
  } = useTransactionForm({ initialTransaction: transaction })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError: setFormError,
  } = form

  const onSubmit = handleSubmit((data) => {
    const numericAmount = validateAndGetAmount()
    if (!numericAmount) return

    updateMutation.mutate(
      {
        id: transaction.id,
        input: {
          amount: numericAmount,
          type: data.type,
          category: data.category,
          description: data.description || undefined,
          payment_method: data.payment_method,
          transaction_date: data.transaction_date,
        },
      },
      {
        onSuccess: () => {
          toast.success("Transaksi berhasil diperbarui")
          onSuccess()
        },
        onError: (error) => {
          const errorMsg = error?.message || "Terjadi kesalahan"
          setFormError("root", { message: errorMsg })
          toast.error(errorMsg)
        },
      }
    )
  })

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Transaksi</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          <TransactionFormFields
            type={type}
            paymentMethod={paymentMethod}
            category={category}
            categories={categories}
            transactionDate={watch("transaction_date")}
            description={watch("description") || ""}
            balanceWarning={balanceWarning}
            errors={errors}
            register={register}
            onTypeChange={handleTypeChange}
            onAmountChange={handleAmountChange}
            onCategoryChange={handleCategoryChange}
            onPaymentMethodChange={handlePaymentMethodChange}
            onDateChange={handleDateChange}
            compact
          />

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary-solid"
              disabled={updateMutation.isPending || !!balanceWarning}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
