"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { TransactionList } from "@/components/dashboard"
import { Select } from "@/components/ui"
import { Transaction } from "@/types"
import { getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"

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
  const [deleting, setDeleting] = useState<string | null>(null)

  const month = searchParams.get("month") || String(getCurrentMonth())
  const year = searchParams.get("year") || String(getCurrentYear())

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/transactions?month=${month}&year=${year}`)
        const data = await res.json()
        if (data.transactions) {
          setTransactions(data.transactions)
        }
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setLoading(false)
      }
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

    setDeleting(id)
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id))
      }
    } catch (error) {
      console.error("Error deleting transaction:", error)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
        Daftar Transaksi
      </h1>

      <div className="flex gap-3">
        <Select
          value={month}
          onChange={(e) => handleFilterChange("month", e.target.value)}
          className="flex-1"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </Select>
        <Select
          value={year}
          onChange={(e) => handleFilterChange("year", e.target.value)}
          className="w-28"
        >
          {YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24 mb-2" />
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
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
