import type { Metadata } from "next"
import DashboardPage from "@/blocks/dashboard"

export const metadata: Metadata = {
  title: "Dashboard - SIKAS",
  description: "Lihat ringkasan keuangan dan transaksi terbaru Anda.",
}

export default function Page() {
  return <DashboardPage />
}
