"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
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
import type { Category, TransactionType, PaymentMethod, User } from "@/types"
import { cn } from "@/lib/utils"
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils/format"
import { userService, categoryService, transactionService } from "@/service"
import { Banknote, Smartphone, Loader2, AlertCircle } from "lucide-react"

const MIN_MBANKING_BALANCE = 50000

export default function AddTransactionPage() {
  const router = useRouter()

  const [type, setType] = useState<TransactionType>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split("T")[0])

  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await userService.getCurrentUser()
      if (userData) setUser(userData)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await categoryService.getCategories(type)
      setCategories(data)
      if (data.length > 0) {
        setCategory(data[0].name)
      }
    }
    fetchCategories()
  }, [type])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const numericAmount = parseInputCurrency(amount)

    if (!numericAmount || !category || !transactionDate) {
      const errorMessage = "Lengkapi semua data"
      setError(errorMessage)
      toast.error(errorMessage)
      return
    }

    if (balanceWarning) {
      setError(balanceWarning)
      toast.error(balanceWarning)
      return
    }

    setLoading(true)
    setError("")

    const result = await transactionService.createTransaction({
      amount: numericAmount,
      type,
      category,
      description: description || undefined,
      payment_method: paymentMethod,
      transaction_date: transactionDate,
    })

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success("Transaksi berhasil disimpan")
    router.push("/dashboard")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputCurrency(e.target.value)
    setAmount(formatted)
  }

  const getCurrentBalance = () => {
    if (!user) return 0
    return paymentMethod === "mbanking" ? Number(user.mbanking_balance) : Number(user.cash_balance)
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="max-w-2xl mx-auto lg:max-w-none">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-neutral-900">Tambah Transaksi</h1>
          <p className="text-sm text-neutral-500 mt-1">Catat transaksi keuangan Anda</p>
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 lg:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Transaction Type */}
                <Tabs value={type} onValueChange={(val) => setType(val as TransactionType)}>
                  <TabsList className="w-full bg-neutral-100 p-1 rounded-xl">
                    <TabsTrigger
                      value="expense"
                      className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <span className={type === "expense" ? "text-red-500 font-medium" : "text-neutral-600"}>
                        Pengeluaran
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="income"
                      className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <span className={type === "income" ? "text-emerald-600 font-medium" : "text-neutral-600"}>
                        Pemasukan
                      </span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Jumlah</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">Rp</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={amount}
                      onChange={handleAmountChange}
                      className="text-2xl font-bold pl-12 h-14"
                    />
                  </div>
                  {type === "expense" && user && (
                    <p className="text-xs text-neutral-500 mt-2">
                      Saldo {paymentMethod === "mbanking" ? "M-Banking" : "Cash"}: {formatCurrency(getCurrentBalance())}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Kategori</label>
                  <Select value={category} onValueChange={setCategory}>
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Metode Pembayaran</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cash")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                        paymentMethod === "cash"
                          ? "border-sky-500 bg-sky-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        paymentMethod === "cash" ? "bg-sky-100" : "bg-neutral-100"
                      )}>
                        <Banknote className={cn(
                          "h-5 w-5",
                          paymentMethod === "cash" ? "text-sky-600" : "text-neutral-400"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        paymentMethod === "cash" ? "text-sky-700" : "text-neutral-600"
                      )}>
                        Cash
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("mbanking")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                        paymentMethod === "mbanking"
                          ? "border-sky-500 bg-sky-50"
                          : "border-neutral-200 hover:border-neutral-300"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        paymentMethod === "mbanking" ? "bg-sky-100" : "bg-neutral-100"
                      )}>
                        <Smartphone className={cn(
                          "h-5 w-5",
                          paymentMethod === "mbanking" ? "text-sky-600" : "text-neutral-400"
                        )} />
                      </div>
                      <span className={cn(
                        "font-medium text-sm",
                        paymentMethod === "mbanking" ? "text-sky-700" : "text-neutral-600"
                      )}>
                        M-Banking
                      </span>
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Tanggal</label>
                  <DatePicker value={transactionDate} onChange={setTransactionDate} placeholder="Pilih tanggal" />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Keterangan <span className="text-neutral-400 font-normal">(opsional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Contoh: Makan siang"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-12"
                  />
                </div>

                {/* Warnings */}
                {balanceWarning && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-700">{balanceWarning}</p>
                  </div>
                )}

                {error && !balanceWarning && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || !amount || !category || !!balanceWarning}
                  size="lg"
                  className="w-full h-12 text-base font-medium"
                >
                  {loading ? (
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
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sticky top-20">
              <h3 className="font-semibold text-neutral-900 mb-4">Saldo Saat Ini</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-sky-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="text-sm text-neutral-600">M-Banking</span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(Number(user?.mbanking_balance || 0))}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <Banknote className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm text-neutral-600">Cash</span>
                  </div>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(Number(user?.cash_balance || 0))}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500 leading-relaxed">
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
