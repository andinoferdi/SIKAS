import type { Metadata } from "next"
import HomePage from "@/blocks/landing/home"

export const metadata: Metadata = {
  title: "SIKAS - Sistem Informasi Keuangan Anda",
  description: "Aplikasi keuangan sederhana untuk mengelola pemasukan dan pengeluaran pribadi, keluarga, atau bisnis Anda.",
}

export default function Page() {
  return <HomePage />
}
