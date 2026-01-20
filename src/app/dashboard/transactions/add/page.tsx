import type { Metadata } from "next"
import AddTransactionPage from "@/blocks/dashboard/add-transaction"

export const metadata: Metadata = {
  title: "Tambah Transaksi - SIKAS",
  description: "Catat transaksi pemasukan atau pengeluaran baru.",
}

export default function Page() {
  return <AddTransactionPage />
}
