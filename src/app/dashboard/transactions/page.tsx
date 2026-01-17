import type { Metadata } from "next"
import { Suspense } from "react"
import TransactionsPage from "@/blocks/dashboard/transactions"

export const metadata: Metadata = {
  title: "Riwayat Transaksi - SIKAS",
  description: "Lihat dan kelola semua riwayat transaksi Anda.",
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <TransactionsPage />
    </Suspense>
  )
}
