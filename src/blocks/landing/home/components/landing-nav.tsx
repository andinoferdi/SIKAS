"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Wallet, PiggyBank, TrendingUp, BarChart3, X } from "lucide-react"
import { LandingNavDesktop } from "@/blocks/landing/home/components/landing-nav-desktop"
import { LandingNavMobile } from "@/blocks/landing/home/components/landing-nav-mobile"
import { startPageScroll, stopPageScroll } from "@/components/scroll"

const features = [
  {
    icon: Wallet,
    title: "Kelola Saldo",
    description: "Pantau saldo M-Banking dan Cash dalam satu tempat",
  },
  {
    icon: PiggyBank,
    title: "Catat Transaksi",
    description: "Catat pemasukan dan pengeluaran dengan mudah",
  },
  {
    icon: TrendingUp,
    title: "Analisis Keuangan",
    description: "Lihat ringkasan keuangan bulanan Anda",
  },
  {
    icon: BarChart3,
    title: "Laporan",
    description: "Laporan lengkap untuk keputusan finansial",
  },
]

export function LandingNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isMobileMenuOpen) return

    stopPageScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      startPageScroll()
    }
  }, [isMobileMenuOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex h-18 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-30 h-9">
              <Image
                src="/images/logo.png"
                alt="SIKAS"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          <button
            type="button"
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <>
                <span className="block w-5 h-0.5 bg-foreground rounded-full" />
                <span className="block w-5 h-0.5 bg-foreground rounded-full" />
                <span className="block w-5 h-0.5 bg-foreground rounded-full" />
              </>
            )}
          </button>

          <LandingNavDesktop features={features} />
        </div>
      </div>

      <LandingNavMobile
        features={features}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  )
}
