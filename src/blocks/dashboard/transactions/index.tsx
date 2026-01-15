"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TransactionList } from "@/blocks/dashboard/components"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui"
import { Transaction } from "@/types"
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
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-xl lg:text-2xl font-bold text-text-primary">
          Daftar Transaksi
        </h1>

        <div className="flex gap-3 w-full lg:w-auto">
          <Select value={month} onValueChange={(value) => handleFilterChange("month", value)}>
            <SelectTrigger className="flex-1 lg:w-40">
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
            <SelectTrigger className="w-28">
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

      <div className="bg-card rounded-2xl p-4 lg:p-6 border border-card-border">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-24 mb-2" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-32" />
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
