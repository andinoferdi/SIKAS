"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui"
import { formatCurrency } from "@/lib/utils/format"
import { useCreateTransaction } from "@/hooks"
import { Banknote, Smartphone, Loader2 } from "lucide-react"
import { useTransactionForm } from "@/blocks/dashboard/components/hooks/use-transaction-form"
import { TransactionFormFields } from "@/blocks/dashboard/components/transaction-form-fields"

export default function AddTransactionPage() {
  const router = useRouter()
  const createMutation = useCreateTransaction()

  const {
    form,
    type,
    amount,
    paymentMethod,
    category,
    categories,
    user,
    balanceWarning,
    handleAmountChange,
    handleTypeChange,
    handleCategoryChange,
    handlePaymentMethodChange,
    handleDateChange,
    validateAndGetAmount,
    getCurrentBalance,
    MIN_MBANKING_BALANCE,
  } = useTransactionForm()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError: setFormError,
  } = form

  // Tombol simpan mati sampai jumlah dan kategori terisi. Sebutkan apa yang
  // kurang supaya user tidak menebak kenapa tombolnya tidak bisa ditekan.
  const missingFields = (() => {
    if (createMutation.isPending || balanceWarning) return null
    const missing = [!amount && "jumlah", !category && "kategori"].filter(Boolean)
    if (missing.length === 0) return null
    return `Isi ${missing.join(" dan ")} dulu untuk menyimpan.`
  })()

  const onSubmit = handleSubmit((data) => {
    const numericAmount = validateAndGetAmount()
    if (!numericAmount) return

    createMutation.mutate(
      {
        amount: numericAmount,
        type: data.type,
        category: data.category,
        description: data.description || undefined,
        payment_method: data.payment_method,
        transaction_date: data.transaction_date,
      },
      {
        onSuccess: () => {
          toast.success("Transaksi berhasil disimpan")
          router.push("/dashboard")
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
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto lg:max-w-none">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Tambah Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-1">Catat transaksi keuangan Anda</p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 lg:p-6">
              <form onSubmit={onSubmit} className="space-y-5">
                <TransactionFormFields
                  type={type}
                  paymentMethod={paymentMethod}
                  category={category}
                  categories={categories}
                  transactionDate={watch("transaction_date")}
                  description={watch("description") || ""}
                  showBalanceInfo={!!user}
                  currentBalance={getCurrentBalance()}
                  balanceWarning={balanceWarning}
                  errors={errors}
                  register={register}
                  onTypeChange={handleTypeChange}
                  onAmountChange={handleAmountChange}
                  onCategoryChange={handleCategoryChange}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  onDateChange={handleDateChange}
                />

                <div>
                  <Button
                    type="submit"
                    variant="primary-solid"
                    disabled={createMutation.isPending || !amount || !category || !!balanceWarning}
                    size="lg"
                    className="w-full"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Transaksi"
                    )}
                  </Button>
                  {missingFields && (
                    <p className="mt-2 text-sm text-muted-foreground">{missingFields}</p>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2">
            <div className="sticky top-20 rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-4">Saldo Saat Ini</h3>

              <div className="divide-y divide-border">
                <div className="flex items-center justify-between gap-3 py-3 first:pt-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fund-mbanking/10">
                      <Smartphone className="h-4 w-4 text-fund-mbanking" />
                    </div>
                    <span className="truncate text-sm text-muted-foreground">M-Banking</span>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {formatCurrency(Number(user?.mbanking_balance || 0))}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 py-3 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fund-cash/10">
                      <Banknote className="h-4 w-4 text-fund-cash" />
                    </div>
                    <span className="truncate text-sm text-muted-foreground">Cash</span>
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {formatCurrency(Number(user?.cash_balance || 0))}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Minimal saldo M-Banking: {formatCurrency(MIN_MBANKING_BALANCE)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
