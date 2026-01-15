"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout"
import { BalanceCard, SummaryCard, TransactionList } from "@/components/dashboard"
import { User, Transaction, MonthlySummary } from "@/types"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<MonthlySummary>({
    total_income: 0,
    total_expense: 0,
    net: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, transactionsRes, summaryRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/transactions?limit=5"),
          fetch("/api/summary"),
        ])

        const userData = await userRes.json()
        const transactionsData = await transactionsRes.json()
        const summaryData = await summaryRes.json()

        if (userData.user) setUser(userData.user)
        if (transactionsData.transactions) setTransactions(transactionsData.transactions)
        if (summaryData.summary) setSummary(summaryData.summary)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-32" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
            <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
          <div className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 text-center">
        <p className="text-zinc-500">Gagal memuat data</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <Header userName={user.name} />

      <div className="grid grid-cols-2 gap-4">
        <BalanceCard
          title="M-Banking"
          amount={user.mbanking_balance}
          type="mbanking"
        />
        <BalanceCard
          title="Cash"
          amount={user.cash_balance}
          type="cash"
        />
      </div>

      <SummaryCard
        income={summary.total_income}
        expense={summary.total_expense}
      />

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-zinc-900 dark:text-white">
            Transaksi Terakhir
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
          <TransactionList transactions={transactions} />
        </div>
      </section>
    </div>
  )
}
