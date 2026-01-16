"use client"

import { useEffect, useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { TransactionList } from "@/blocks/dashboard/components"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui"
import type { Transaction } from "@/types"
import { getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"
import { transactionService } from "@/service"
import { Calendar, ArrowUpRight, ArrowDownRight, LayoutList } from "lucide-react"
import { cn } from "@/lib/utils"

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1),
}))

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = getCurrentYear() - 2 + i
  return { value: String(year), label: String(year) }
})

const TYPE_FILTERS = [
  { value: "all", label: "Semua", icon: LayoutList },
  { value: "income", label: "Masuk", icon: ArrowUpRight },
  { value: "expense", label: "Keluar", icon: ArrowDownRight },
]

export default function TransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const month = searchParams.get("month") || String(getCurrentMonth())
  const year = searchParams.get("year") || String(getCurrentYear())
  const typeFilter = searchParams.get("type") || "all"

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      const data = await transactionService.getTransactions({ month, year })
      setTransactions(data)
      setLoading(false)
    }

    fetchTransactions()
  }, [month, year])

  // Filter transactions by type (client-side)
  const filteredTransactions = useMemo(() => {
    if (typeFilter === "all") return transactions
    return transactions.filter((t) => t.type === typeFilter)
  }, [transactions, typeFilter])

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/dashboard/transactions?${params.toString()}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return

    const success = await transactionService.deleteTransaction(id)
    if (success) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      toast.success("Transaksi berhasil dihapus")
    } else {
      toast.error("Gagal menghapus transaksi")
    }
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Riwayat Transaksi</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {getMonthName(Number(month))} {year}
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex gap-2">
          <Select value={month} onValueChange={(value) => handleFilterChange("month", value)}>
            <SelectTrigger className="w-full sm:w-36 h-10 bg-white cursor-pointer">
              <Calendar className="h-4 w-4 text-neutral-400 mr-2" />
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={(value) => handleFilterChange("year", value)}>
            <SelectTrigger className="w-24 h-10 bg-white cursor-pointer">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y.value} value={y.value}>
                  {y.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl">
        {TYPE_FILTERS.map((filter) => {
          const Icon = filter.icon
          const isActive = typeFilter === filter.value
          return (
            <button
              key={filter.value}
              onClick={() => handleFilterChange("type", filter.value)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all cursor-pointer",
                isActive
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Icon className={cn(
                "h-4 w-4",
                isActive && filter.value === "income" && "text-emerald-600",
                isActive && filter.value === "expense" && "text-red-500"
              )} />
              <span className="hidden sm:inline">{filter.label}</span>
            </button>
          )
        })}
      </div>

      {/* Transaction List Card */}
      <div className="bg-white rounded-2xl p-4 lg:p-5 border border-neutral-200">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 animate-pulse">
                <div className="w-11 h-11 rounded-xl bg-neutral-200" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-28 mb-2" />
                  <div className="h-3 bg-neutral-200 rounded w-36" />
                </div>
                <div className="text-right">
                  <div className="h-4 bg-neutral-200 rounded w-20 mb-2" />
                  <div className="h-3 bg-neutral-200 rounded w-14" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onDelete={handleDelete}
            emptyMessage={
              typeFilter === "all"
                ? `Tidak ada transaksi di ${getMonthName(Number(month))} ${year}`
                : `Tidak ada transaksi ${typeFilter === "income" ? "masuk" : "keluar"} di ${getMonthName(Number(month))} ${year}`
            }
          />
        )}
      </div>

      {/* Transaction Count */}
      {!loading && filteredTransactions.length > 0 && (
        <p className="text-center text-sm text-neutral-500">
          {filteredTransactions.length} transaksi ditemukan
        </p>
      )}
    </div>
  )
}
