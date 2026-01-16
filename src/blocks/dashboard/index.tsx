"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BalanceCard, SummaryCard, TransactionList } from "@/blocks/dashboard/components"
import type { User, Transaction, MonthlySummary } from "@/types"
import { userService, transactionService, summaryService } from "@/service"
import { ChevronRight } from "lucide-react"

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
      <div className="p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">
        <div className="space-y-2">
          <div className="h-7 bg-neutral-200 rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-neutral-200 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-neutral-200 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-6 text-center min-h-screen flex items-center justify-center pb-24 lg:pb-6">
        <div>
          <p className="text-neutral-700 text-lg font-medium">Gagal memuat data</p>
          <p className="text-neutral-500 text-sm mt-2">Silakan refresh halaman atau logout</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header - Desktop Only */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-neutral-900">Halo, {user.name}</h1>
        <p className="text-neutral-500 mt-1">Selamat datang kembali di dashboard Anda</p>
      </div>

      {/* Mobile Greeting */}
      <div className="lg:hidden">
        <p className="text-neutral-500 text-sm">Selamat datang kembali,</p>
        <h1 className="text-xl font-bold text-neutral-900">{user.name}</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BalanceCard title="M-Banking" amount={user.mbanking_balance} type="mbanking" />
        <BalanceCard title="Cash" amount={user.cash_balance} type="cash" />
        <div className="col-span-2 hidden lg:block">
          <SummaryCard income={summary.total_income} expense={summary.total_expense} />
        </div>
      </div>

      {/* Mobile Summary */}
      <div className="lg:hidden">
        <SummaryCard income={summary.total_income} expense={summary.total_expense} />
      </div>

      {/* Transactions Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Transaksi Terakhir</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Aktivitas keuangan terbaru</p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors group"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-4 lg:p-5 border border-neutral-200">
          <TransactionList transactions={transactions} />
        </div>
      </section>
    </div>
  )
}
