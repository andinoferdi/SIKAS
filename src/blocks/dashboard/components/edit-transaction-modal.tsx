"use client"

import type React from "react"
import { useEffect, useState, useMemo } from "react"
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
import type { Category, TransactionType, PaymentMethod, User, Transaction } from "@/types"
import { cn } from "@/lib/utils"
import { formatInputCurrency, parseInputCurrency, formatCurrency } from "@/lib/utils/format"
import { userService, categoryService, transactionService } from "@/services"
import { Banknote, Smartphone, Loader2, AlertCircle, X } from "lucide-react"

const MIN_MBANKING_BALANCE = 50000

interface EditTransactionModalProps {
  transaction: Transaction
  onClose: () => void
  onSuccess: (updatedTransaction: Transaction) => void
}

export function EditTransactionModal({ transaction, onClose, onSuccess }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>(transaction.type)
  const [amount, setAmount] = useState(formatInputCurrency(String(transaction.amount)))
  const [category, setCategory] = useState(transaction.category)
  const [description, setDescription] = useState(transaction.description || "")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(transaction.payment_method)
  const [transactionDate, setTransactionDate] = useState(transaction.transaction_date)

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
      // Only reset category if type changed and current category not in new list
      if (!data.find(c => c.name === category)) {
        if (data.length > 0) {
          setCategory(data[0].name)
        }
      }
    }
    fetchCategories()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  const balanceWarning = useMemo(() => {
    if (!user) return ""

    const numericAmount = parseInputCurrency(amount)
    if (!numericAmount) return ""

    const oldAmount = transaction.amount
    const oldType = transaction.type
    const oldPaymentMethod = transaction.payment_method

    let mbankingBalance = Number(user.mbanking_balance)
    let cashBalance = Number(user.cash_balance)

    // Undo old transaction
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

    // Apply new transaction
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

    // Validate
    if (cashBalance < 0) {
      return "Saldo Cash tidak cukup untuk perubahan ini"
    }

    if (mbankingBalance < MIN_MBANKING_BALANCE) {
      return `Saldo M-Banking minimal harus ${formatCurrency(MIN_MBANKING_BALANCE)}`
    }

    return ""
  }, [amount, paymentMethod, type, user, transaction])

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

    const result = await transactionService.updateTransaction(transaction.id, {
      amount: numericAmount,
      type,
      category,
      description: description || undefined,
      payment_method: paymentMethod,
      transaction_date: transactionDate,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      toast.error(result.error)
      return
    }

    if (result.transaction) {
      toast.success("Transaksi berhasil diperbarui")
      onSuccess(result.transaction)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "")
    setAmount(formatInputCurrency(raw))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Edit Transaksi</h2>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tipe</label>
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
              <TabsList className="w-full">
                <TabsTrigger value="expense" className="flex-1">Pengeluaran</TabsTrigger>
                <TabsTrigger value="income" className="flex-1">Pemasukan</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Jumlah</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm">Rp</span>
              <Input
                type="text"
                inputMode="numeric"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="pl-10"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Kategori</label>
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Deskripsi (opsional)</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tambahkan catatan"
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                  paymentMethod === "cash"
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                )}
              >
                <Banknote className="h-5 w-5" />
                <span className="font-medium">Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("mbanking")}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all",
                  paymentMethod === "mbanking"
                    ? "border-sky-500 bg-sky-50 text-sky-700"
                    : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                )}
              >
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">M-Banking</span>
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Tanggal</label>
            <DatePicker
              value={transactionDate}
              onChange={(date) => setTransactionDate(date)}
              placeholder="Pilih tanggal"
            />
          </div>

          {/* Balance Warning */}
          {balanceWarning && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{balanceWarning}</p>
            </div>
          )}

          {/* Error */}
          {error && !balanceWarning && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
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
              disabled={loading || !!balanceWarning}
              className="flex-1"
            >
              {loading ? (
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
