"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Select } from "@/components/ui"
import { Category, TransactionType, PaymentMethod, User } from "@/types"
import { cn } from "@/lib/utils"
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils/format"

const MIN_MBANKING_BALANCE = 50000

export default function AddTransactionPage() {
  const router = useRouter()

  const [type, setType] = useState<TransactionType>("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  )

  const [categories, setCategories] = useState<Category[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [balanceWarning, setBalanceWarning] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        const data = await res.json()
        if (data.user) setUser(data.user)
      } catch (error) {
        console.error("Error fetching user:", error)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`/api/categories?type=${type}`)
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
          if (data.categories.length > 0) {
            setCategory(data.categories[0].name)
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    fetchCategories()
  }, [type])

  useEffect(() => {
    if (!user || type !== "expense") {
      setBalanceWarning("")
      return
    }

    const numericAmount = parseInputCurrency(amount)
    if (!numericAmount) {
      setBalanceWarning("")
      return
    }

    const currentBalance = paymentMethod === "mbanking"
      ? Number(user.mbanking_balance)
      : Number(user.cash_balance)

    if (numericAmount > currentBalance) {
      setBalanceWarning("Saldo tidak cukup")
      return
    }

    if (paymentMethod === "mbanking") {
      const remainingBalance = currentBalance - numericAmount
      if (remainingBalance < MIN_MBANKING_BALANCE) {
        setBalanceWarning(`Minimal saldo M-Banking harus ${formatCurrency(MIN_MBANKING_BALANCE)}`)
        return
      }
    }

    setBalanceWarning("")
  }, [amount, paymentMethod, type, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const numericAmount = parseInputCurrency(amount)

    if (!numericAmount || !category || !transactionDate) {
      setError("Lengkapi semua data")
      return
    }

    if (balanceWarning) {
      setError(balanceWarning)
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numericAmount,
          type,
          category,
          description: description || null,
          payment_method: paymentMethod,
          transaction_date: transactionDate,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Gagal menyimpan transaksi")
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputCurrency(e.target.value)
    setAmount(formatted)
  }

  const getCurrentBalance = () => {
    if (!user) return 0
    return paymentMethod === "mbanking"
      ? Number(user.mbanking_balance)
      : Number(user.cash_balance)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
        Tambah Transaksi
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType("expense")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
              type === "expense"
                ? "bg-white dark:bg-zinc-900 text-red-600 shadow-sm"
                : "text-zinc-500"
            )}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={cn(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors",
              type === "income"
                ? "bg-white dark:bg-zinc-900 text-emerald-600 shadow-sm"
                : "text-zinc-500"
            )}
          >
            Pemasukan
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Jumlah (Rp)
          </label>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={handleAmountChange}
            className="text-2xl font-bold"
          />
          {type === "expense" && user && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Saldo {paymentMethod === "mbanking" ? "M-Banking" : "Cash"}: {formatCurrency(getCurrentBalance())}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Kategori
          </label>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Metode Pembayaran
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors",
                paymentMethod === "cash"
                  ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              )}
            >
              Cash
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("mbanking")}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-colors",
                paymentMethod === "mbanking"
                  ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              )}
            >
              M-Banking
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Tanggal
          </label>
          <Input
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Keterangan (opsional)
          </label>
          <Input
            type="text"
            placeholder="Contoh: Makan siang"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {balanceWarning && (
          <p className="text-amber-600 dark:text-amber-400 text-sm text-center bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg">
            {balanceWarning}
          </p>
        )}

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading || !amount || !category || !!balanceWarning}
          size="lg"
          className="w-full"
        >
          {loading ? "Menyimpan..." : "Simpan Transaksi"}
        </Button>
      </form>
    </div>
  )
}
