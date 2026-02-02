"use client"

import Link from "next/link"
import { BalanceCard, SummaryCard, TransactionList } from "@/blocks/dashboard/components"
import { useCurrentUser, useTransactions, useMonthlySummary } from "@/hooks"
import { ErrorState } from "@/components/ui"
import { ChevronRight } from "lucide-react"

export default function DashboardPage() {
  const { data: user, isLoading: userLoading, isError: userError, refetch: refetchUser } = useCurrentUser()
  const { data: transactions = [], isLoading: transactionsLoading, isError: transactionsError, refetch: refetchTransactions } = useTransactions({ limit: 5 })
  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: refetchSummary } = useMonthlySummary()

  const loading = userLoading || transactionsLoading || summaryLoading
  const hasError = userError || transactionsError || summaryError

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6 pb-24 lg:pb-6">
        <div className="space-y-2">
          <div className="h-7 bg-muted rounded-lg w-48 animate-pulse" />
          <div className="h-4 bg-muted rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-40 bg-muted rounded-2xl animate-pulse" />
        <div className="h-48 bg-muted rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (hasError) {
    const handleRetry = () => {
      refetchUser()
      refetchTransactions()
      refetchSummary()
    }
    return (
      <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center pb-24 lg:pb-6">
        <ErrorState 
          message="Gagal memuat data dashboard" 
          onRetry={handleRetry} 
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center pb-24 lg:pb-6">
        <ErrorState 
          message="Gagal memuat data. Silakan refresh halaman atau logout." 
        />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-foreground">Halo, {user.name}</h1>
        <p className="text-muted-foreground mt-1">Selamat datang kembali di dashboard Anda</p>
      </div>

      <div className="lg:hidden">
        <p className="text-muted-foreground text-sm">Selamat datang kembali,</p>
        <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <BalanceCard title="M-Banking" amount={user.mbanking_balance} type="mbanking" />
        <BalanceCard title="Cash" amount={user.cash_balance} type="cash" />
      </div>

      <SummaryCard
        income={summary?.total_income || 0}
        expense={summary?.total_expense || 0}
      />

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Transaksi Terakhir</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Aktivitas keuangan terbaru</p>
          </div>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="bg-card rounded-2xl p-4 lg:p-5 border border-border">
          <TransactionList transactions={transactions} />
        </div>
      </section>
    </div>
  )
}
