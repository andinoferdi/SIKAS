"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronDown, Wallet, PiggyBank, TrendingUp, BarChart3, X } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 150)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-[120px] h-[36px]">
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

          <nav className="hidden lg:flex items-center gap-1">
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={cn(
                  "flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                  isDropdownOpen && "text-foreground"
                )}
              >
                Fitur
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    isDropdownOpen && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "absolute top-full left-0 pt-2 transition-all duration-200",
                  isDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
                )}
              >
                <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-4 min-w-[400px]">
                  <div className="grid grid-cols-1 gap-1">
                    {features.map((feature) => (
                      <Link
                        key={feature.title}
                        href="#fitur"
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <feature.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-[15px]">
                            {feature.title}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {feature.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="#tentang"
              className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Tentang
            </Link>
            <Link
              href="#panduan"
              className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Panduan
            </Link>
            <Link
              href="#faq"
              className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQ
            </Link>

            <Link
              href="/login"
              className="ml-4 px-6 py-2.5 text-[15px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
            >
              Login
            </Link>
          </nav>
        </div>
      </div>

      <div
        className={cn(
          "lg:hidden fixed inset-0 top-[72px] bg-card z-40 transition-all duration-300",
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <nav className="flex flex-col p-4">
          <div className="border-b border-border/50 pb-4 mb-4">
            <button
              type="button"
              className="flex items-center justify-between w-full py-3 text-base font-medium text-foreground"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Fitur
              <ChevronDown
                className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            <div
              className={cn(
                "overflow-hidden transition-all duration-300",
                isDropdownOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="pt-2 space-y-1">
                {features.map((feature) => (
                  <Link
                    key={feature.title}
                    href="#fitur"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setIsDropdownOpen(false)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">
                        {feature.title}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="#tentang"
            className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Tentang
          </Link>
          <Link
            href="#panduan"
            className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Panduan
          </Link>
          <Link
            href="#faq"
            className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FAQ
          </Link>

          <div className="mt-6 pt-6 border-t border-border/50">
            <Link
              href="/login"
              className="block w-full py-3 text-center text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
