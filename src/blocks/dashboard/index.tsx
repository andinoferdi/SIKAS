"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Header } from "@/components/layout"
import { BalanceCard, SummaryCard, TransactionList } from "@/blocks/dashboard/components"
import { User, Transaction, MonthlySummary } from "@/types"
import { userService, transactionService, summaryService } from "@/service"

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
      const [userData, transactionsData, summaryData] = await Promise.all([
        userService.getCurrentUser(),
        transactionService.getTransactions({ limit: 5 }),
        summaryService.getMonthlySummary(),
      ])

      if (userData) setUser(userData)
      setTransactions(transactionsData)
      setSummary(summaryData)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-32" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
            <div className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
          </div>
          <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-6 text-center">
        <p className="text-text-muted">Gagal memuat data</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="lg:hidden">
        <Header userName={user.name} />
      </div>

      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-text-primary">
          Halo, {user.name}
        </h1>
        <p className="text-text-muted mt-1">
          Selamat datang kembali
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
        <div className="col-span-2 hidden lg:block">
          <SummaryCard
            income={summary.total_income}
            expense={summary.total_expense}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <SummaryCard
          income={summary.total_income}
          expense={summary.total_expense}
        />
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-text-primary">
            Transaksi Terakhir
          </h2>
          <Link
            href="/dashboard/transactions"
            className="text-sm text-primary hover:underline"
          >
            Lihat Semua
          </Link>
        </div>
        <div className="bg-card rounded-2xl p-4 lg:p-6 border border-card-border">
          <TransactionList transactions={transactions} />
        </div>
      </section>
    </div>
  )
}
