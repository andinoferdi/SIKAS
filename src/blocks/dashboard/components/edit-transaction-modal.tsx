"use client"

import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Button,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  DatePicker,
} from "@/components/ui"
import type { TransactionType, Transaction } from "@/types"
import { cn } from "@/lib/utils"
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils/format"
import { useCurrentUser, useCategories, useUpdateTransaction } from "@/hooks"
import { transactionFormSchema, type TransactionFormData } from "@/lib/validations"
import { Banknote, Smartphone, Loader2, AlertCircle, X } from "lucide-react"

const MIN_MBANKING_BALANCE = 50000
/* eslint-disable react-hooks/incompatible-library */

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSuccess: () => void
}

export function EditTransactionModal({ transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const { data: user } = useCurrentUser()
  const updateMutation = useUpdateTransaction()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError: setFormError,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: transaction.type,
      amount: formatInputCurrency(String(transaction.amount)),
      category: transaction.category,
      description: transaction.description || "",
      payment_method: transaction.payment_method,
      transaction_date: transaction.transaction_date,
    },
  })

  const type = watch("type")
  const amount = watch("amount")
  const paymentMethod = watch("payment_method")
  const category = watch("category")

  const { data: categories = [] } = useCategories(type)

  const validCategory = useMemo(() => {
    if (categories.find(c => c.name === category)) return category
    return categories.length > 0 ? categories[0].name : category
  }, [categories, category])

  if (validCategory !== category && validCategory) {
    setValue("category", validCategory)
  }

  const balanceWarning = useMemo(() => {
    if (!user) return ""

    const numericAmount = parseInputCurrency(amount)
    if (!numericAmount) return ""

    const oldAmount = transaction.amount
    const oldType = transaction.type
    const oldPaymentMethod = transaction.payment_method

    let mbankingBalance = Number(user.mbanking_balance)
    let cashBalance = Number(user.cash_balance)

    if (oldType === "expense") {
      if (oldPaymentMethod === "mbanking") {
        mbankingBalance += oldAmount
      } else {
        cashBalance += oldAmount
      }
    } else {
      if (oldPaymentMethod === "mbanking") {
        mbankingBalance -= oldAmount
      } else {
        cashBalance -= oldAmount
      }
    }

    if (type === "expense") {
      if (paymentMethod === "mbanking") {
        mbankingBalance -= numericAmount
      } else {
        cashBalance -= numericAmount
      }
    } else {
      if (paymentMethod === "mbanking") {
        mbankingBalance += numericAmount
      } else {
        cashBalance += numericAmount
      }
    }

    if (cashBalance < 0) {
      return "Saldo Cash tidak cukup untuk perubahan ini"
    }

    if (mbankingBalance < MIN_MBANKING_BALANCE) {
      return `Saldo M-Banking minimal harus ${formatCurrency(MIN_MBANKING_BALANCE)}`
    }

    return ""
  }, [amount, paymentMethod, type, user, transaction])

  const onSubmit = (data: TransactionFormData) => {
    const numericAmount = parseInputCurrency(data.amount)

    if (!numericAmount) {
      toast.error("Jumlah tidak valid")
      return
    }

    if (balanceWarning) {
      setFormError("root", { message: balanceWarning })
      toast.error(balanceWarning)
      return
    }

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
  }

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Edit Transaksi</h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Tipe</label>
            <Tabs value={type} onValueChange={(v) => setValue("type", v as TransactionType)}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">Pengeluaran</TabsTrigger>
                <TabsTrigger value="income" className="flex-1">Pemasukan</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Jumlah</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="0"
                {...register("amount")}
                onChange={(e) => {
                  const formatted = formatInputCurrency(e.target.value)
                  setValue("amount", formatted)
                }}
                className="pl-10"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-danger-text mt-1">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Kategori</label>
            <Select value={category || validCategory} onValueChange={(val) => setValue("category", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-danger-text mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Deskripsi (opsional)</label>
            <Input
              type="text"
              placeholder="Tambahkan catatan"
              {...register("description")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("payment_method", "cash")}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <Banknote className="h-5 w-5" />
                <span className="font-medium">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setValue("payment_method", "mbanking")}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  paymentMethod === "mbanking"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">M-Banking</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Tanggal</label>
            <DatePicker
              value={watch("transaction_date")}
              onChange={(date) => setValue("transaction_date", date)}
              placeholder="Pilih tanggal"
            />
          </div>

          {balanceWarning && (
            <div className="flex items-start gap-3 p-4 bg-danger-bg border border-danger-border rounded-xl">
              <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger-text">{balanceWarning}</p>
            </div>
          )}

          {errors.root && !balanceWarning && (
            <div className="flex items-start gap-3 p-4 bg-danger-bg border border-danger-border rounded-xl">
              <AlertCircle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger-text">{errors.root.message}</p>
            </div>
          )}

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
