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
import { DollarSign, Building2 } from "lucide-react"

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
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-text-primary">Tambah Transaksi</h1>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
          <Tabs value={type} onValueChange={(val) => setType(val as TransactionType)}>
            <TabsList className="w-full">
              <TabsTrigger value="expense" className="flex-1">
                <span className="text-danger">Pengeluaran</span>
              </TabsTrigger>
              <TabsTrigger value="income" className="flex-1">
                <span className="text-success">Pemasukan</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Jumlah (Rp)</label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={handleAmountChange}
              className="text-2xl font-bold"
            />
            {type === "expense" && user && (
              <p className="text-xs text-text-muted mt-1">
                Saldo {paymentMethod === "mbanking" ? "M-Banking" : "Cash"}: {formatCurrency(getCurrentBalance())}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Kategori</label>
            <Select value={category} onValueChange={setCategory}>
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
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Metode Pembayaran</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2",
                  paymentMethod === "cash"
                    ? "border-primary bg-sky-50 text-primary shadow-sm"
                    : "border-neutral-200 text-text-secondary hover:border-neutral-300",
                )}
              >
                <DollarSign className="h-4 w-4" />
                <span>Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("mbanking")}
                className={cn(
                  "flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-2",
                  paymentMethod === "mbanking"
                    ? "border-primary bg-sky-50 text-primary shadow-sm"
                    : "border-neutral-200 text-text-secondary hover:border-neutral-300",
                )}
              >
                <Building2 className="h-4 w-4" />
                <span>M-Banking</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Tanggal</label>
            <DatePicker value={transactionDate} onChange={setTransactionDate} placeholder="Pilih tanggal" />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Keterangan (opsional)</label>
            <Input
              type="text"
              placeholder="Contoh: Makan siang"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {balanceWarning && (
            <p className="text-warning-text text-sm text-center bg-warning-bg p-2 rounded-lg">{balanceWarning}</p>
          )}

          {error && <p className="text-danger-text text-sm text-center bg-danger-bg p-2 rounded-lg">{error}</p>}

          <Button
            type="submit"
            disabled={loading || !amount || !category || !!balanceWarning}
            size="lg"
            className="w-full"
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </form>

        <div className="hidden lg:block">
          <div className="bg-card rounded-2xl p-6 border border-card-border sticky top-6">
            <h2 className="font-semibold text-text-primary mb-4">Saldo Saat Ini</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-neutral-200">
                <span className="text-text-secondary">M-Banking</span>
                <span className="font-semibold text-text-primary">
                  {formatCurrency(Number(user?.mbanking_balance || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-text-secondary">Cash</span>
                <span className="font-semibold text-text-primary">
                  {formatCurrency(Number(user?.cash_balance || 0))}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-card-border">
              <div className="text-xs text-text-muted">
                <p>• Minimal saldo M-Banking: {formatCurrency(MIN_MBANKING_BALANCE)}</p>
                <p className="mt-1">• Saldo tidak boleh negatif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
