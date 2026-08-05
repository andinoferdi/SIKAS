"use client"

import Link from "next/link"
import { BookOpen, Wallet, Calculator, Lightbulb, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const GUIDES = [
  {
    id: "getting-started",
    title: "Memulai SIKAS",
    description: "Panduan awal untuk pengguna baru: Registrasi, verifikasi, dan tur dashboard pertama kali.",
    icon: BookOpen,
    href: "#",
    color: "bg-primary/10 text-primary",
  },
  {
    id: "managing-transactions",
    title: "Manajemen Transaksi",
    description: "Cara mencatat pemasukan dan pengeluaran, mengedit data, serta melihat riwayat transaksi.",
    icon: Wallet,
    href: "#",
    color: "bg-success/10 text-success",
  },
  {
    id: "budgeting-101",
    title: "Dasar Penganggaran",
    description: "Pelajari metode 50/30/20 untuk mengelola gaji bulanan agar tidak boncos di akhir bulan.",
    icon: Calculator,
    href: "#",
    color: "bg-info/10 text-info",
  },
  {
    id: "ai-features",
    title: "Memaksimalkan Fitur AI",
    description: "Tips menggunakan asisten AI untuk analisis pengeluaran dan scan struk belanja otomatis.",
    icon: Lightbulb,
    href: "#",
    color: "bg-warning/10 text-warning",
  },
]

export default function GuideList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {GUIDES.map((guide) => {
        const Icon = guide.icon
        return (
          <Link
            key={guide.id}
            href={guide.href}
            className="group relative bg-card border border-border rounded-xl p-5 sm:p-6 transition-all hover:bg-muted/30 hover:shadow-lg hover:-translate-y-1 block"
          >
            <div className="flex items-start gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors", guide.color)}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {guide.description}
                </p>
                <div className="flex items-center text-primary text-sm font-medium font-mono uppercase tracking-wider">
                  Baca Panduan <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
