"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { TransactionList } from "@/blocks/dashboard/components"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui"
import type { Transaction } from "@/types"
import { getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"
import { transactionService } from "@/service"

const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: getMonthName(i + 1),
}))

const YEARS = Array.from({ length: 5 }, (_, i) => {
  const year = getCurrentYear() - 2 + i
  return { value: String(year), label: String(year) }
})

export default function TransactionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const month = searchParams.get("month") || String(getCurrentMonth())
  const year = searchParams.get("year") || String(getCurrentYear())

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      const data = await transactionService.getTransactions({ month, year })
      setTransactions(data)
      setLoading(false)
    }

    fetchTransactions()
  }, [month, year])

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
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-4 lg:gap-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Riwayat Transaksi</h1>
          <p className="text-sm text-neutral-600 mt-2">Kelola dan pantau semua aktivitas keuangan Anda</p>
        </div>

        <div className="flex gap-3 w-full lg:w-auto">
          <Select value={month} onValueChange={(value) => handleFilterChange("month", value)}>
            <SelectTrigger className="flex-1 lg:flex-none lg:w-44 bg-card border-neutral-200">
              <SelectValue placeholder="Pilih bulan" />
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
            <SelectTrigger className="flex-1 lg:flex-none w-32 bg-card border-neutral-200">
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

      {/* Transaction List Card */}
      <div className="bg-card rounded-lg p-4 lg:p-6 border border-neutral-200 shadow-sm">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-neutral-200" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
                  <div className="h-3 bg-neutral-200 rounded w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            emptyMessage={`Tidak ada transaksi di ${getMonthName(Number(month))} ${year}`}
          />
        )}
      </div>
    </div>
  )
}
