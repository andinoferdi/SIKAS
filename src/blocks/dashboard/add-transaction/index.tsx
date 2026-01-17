"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
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
import type { TransactionType } from "@/types"
import { cn } from "@/lib/utils"
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils/format"
import { useCurrentUser, useCategories, useCreateTransaction } from "@/hooks"
import { transactionFormSchema, type TransactionFormData } from "@/lib/validations"
import { Banknote, Smartphone, Loader2, AlertCircle } from "lucide-react"

const MIN_MBANKING_BALANCE = 50000

/* eslint-disable react-hooks/incompatible-library */
export default function AddTransactionPage() {
  const router = useRouter()

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
      type: "expense",
      amount: "",
      category: "",
      description: "",
      payment_method: "cash",
      transaction_date: new Date().toISOString().split("T")[0],
    },
  })

  const type = watch("type")
  const amount = watch("amount")
  const paymentMethod = watch("payment_method")
  const category = watch("category")

  const { data: user } = useCurrentUser()
  const { data: categories = [] } = useCategories(type)
  const createMutation = useCreateTransaction()

  const defaultCategory = categories.length > 0 ? categories[0].name : ""
  
  if (categories.length > 0 && !category) {
    setValue("category", defaultCategory)
  }

  const balanceWarning = useMemo(() => {
    if (!user || type !== "expense") {
      return ""
    }

    const numericAmount = parseInputCurrency(amount)
    if (!numericAmount) {
      return ""
    }

    const currentBalance = paymentMethod === "mbanking" ? Number(user.mbanking_balance) : Number(user.cash_balance)

    if (numericAmount > currentBalance) {
      return "Saldo tidak cukup"
    }

    if (paymentMethod === "mbanking") {
      const remainingBalance = currentBalance - numericAmount
      if (remainingBalance < MIN_MBANKING_BALANCE) {
        return `Minimal saldo M-Banking harus ${formatCurrency(MIN_MBANKING_BALANCE)}`
      }
    }

    return ""
  }, [amount, paymentMethod, type, user])

  const onSubmit = async (data: TransactionFormData) => {
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
  }

  const getCurrentBalance = () => {
    if (!user) return 0
    return paymentMethod === "mbanking" ? Number(user.mbanking_balance) : Number(user.cash_balance)
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto lg:max-w-none">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">Tambah Transaksi</h1>
          <p className="text-sm text-muted-foreground mt-1">Catat transaksi keuangan Anda</p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl border border-border p-5 lg:p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Transaction Type */}
                <Tabs value={type} onValueChange={(val) => setValue("type", val as TransactionType)}>
                  <TabsList className="w-full bg-muted p-1 rounded-xl">
                    <TabsTrigger
                      value="expense"
                      className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      <span className={type === "expense" ? "text-destructive font-medium" : "text-muted-foreground"}>
                        Pengeluaran
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="income"
                      className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
                    >
                      <span className={type === "income" ? "text-success font-medium" : "text-muted-foreground"}>
                        Pemasukan
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">Rp</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      {...register("amount")}
                      onChange={(e) => {
                        const formatted = formatInputCurrency(e.target.value)
                        setValue("amount", formatted)
                      }}
                      className="text-2xl font-bold pl-12 h-14"
                    />
                  </div>
                  {type === "expense" && user && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Saldo {paymentMethod === "mbanking" ? "M-Banking" : "Cash"}: {formatCurrency(getCurrentBalance())}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Kategori</label>
                  <Select value={category || defaultCategory} onValueChange={(val) => setValue("category", val)}>
                    <SelectTrigger className="h-12">
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
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue("payment_method", "cash")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                        paymentMethod === "cash"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        paymentMethod === "cash" ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Banknote className={cn(
                          "h-5 w-5",
                          paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
                      )}>
                        Cash
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("payment_method", "mbanking")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                        paymentMethod === "mbanking"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        paymentMethod === "mbanking" ? "bg-primary/20" : "bg-muted"
                      )}>
                        <Smartphone className={cn(
                          "h-5 w-5",
                          paymentMethod === "mbanking" ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        paymentMethod === "mbanking" ? "text-primary" : "text-muted-foreground"
                      )}>
                        M-Banking
                      </span>
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Tanggal</label>
                  <DatePicker value={watch("transaction_date")} onChange={(val) => setValue("transaction_date", val)} placeholder="Pilih tanggal" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">
                    Keterangan <span className="text-muted-foreground font-normal">(opsional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: Makan siang"
                    {...register("description")}
                    className="h-12"
                  />
                </div>

                {/* Warnings */}
                {balanceWarning && (
                  <div className="flex items-center gap-2 p-3 bg-warning-bg border border-warning-border rounded-xl">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                    <p className="text-sm text-warning-text">{balanceWarning}</p>
                  </div>
                )}

                {errors.root && !balanceWarning && (
                  <div className="flex items-center gap-2 p-3 bg-danger-bg border border-danger-border rounded-xl">
                    <AlertCircle className="h-4 w-4 text-danger shrink-0" />
                    <p className="text-sm text-danger-text">{errors.root.message}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={createMutation.isPending || !amount || !category || !!balanceWarning}
                  size="lg"
                  className="w-full h-12 text-base font-medium"
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
              </form>
            </div>
          </div>

          {/* Sidebar Info - Desktop Only */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Saldo Saat Ini</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">M-Banking</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(Number(user?.mbanking_balance || 0))}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-success-bg rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-success-bg-dark flex items-center justify-center">
                      <Banknote className="h-4 w-4 text-success" />
                    </div>
                    <span className="text-sm text-muted-foreground">Cash</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(Number(user?.cash_balance || 0))}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground leading-relaxed">
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
