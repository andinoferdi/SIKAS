"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Wallet, TrendingUp, PieChart } from "lucide-react"

const ROTATING_WORDS = ["Pribadi", "Keluarga", "Bisnis", "Masa Depan", "Semua"]

export function HeroSection() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden bg-card">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[calc(100vh-80px)] py-12 lg:py-0">
          <div className="flex flex-col gap-6 text-center lg:text-left order-2 lg:order-1">
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.15] text-foreground">
              Kelola Keuangan
              <br />
              untuk{" "}
              <span
                className={`inline-block text-primary underline decoration-primary/50 decoration-4 underline-offset-4 transition-all duration-300 ${
                  isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                }`}
              >
                {ROTATING_WORDS[currentWordIndex]}
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-112.5 mx-auto lg:mx-0 leading-relaxed">
              Catat pengeluaran dan pemasukan dengan mudah.
              <br className="hidden sm:block" />
              Kelola keuangan untuk masa depan yang lebih baik.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-semibold gap-2 group rounded-full bg-primary hover:bg-primary/90"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base font-semibold rounded-full border-2"
                >
                  Masuk
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Data Terenkripsi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">100% Gratis</span>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-87.5 h-87.5 sm:w-112.5 sm:h-112.5 lg:w-137.5 lg:h-137.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, transparent) 0%, color-mix(in srgb, var(--primary) 3%, transparent) 100%)",
                }}
              ></div>
            </div>

            <div className="absolute top-10 right-10 lg:top-20 lg:right-0">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
            </div>

            <div className="absolute bottom-20 left-0 lg:left-10">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
            </div>

            <div className="absolute top-1/4 left-0 lg:-left-5">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <PieChart className="w-6 h-6 text-warning" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative w-60 sm:w-65 lg:w-70">
                <div className="bg-foreground rounded-[3rem] p-3 shadow-2xl">
                  <div className="relative bg-background rounded-[2.5rem] overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-foreground rounded-b-3xl z-10"></div>
                    
                    <div className="bg-card px-5 py-4 pt-8">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <span className="font-bold text-sm text-primary">SIKAS</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs">
                          D
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-6 space-y-3.5">
                      <div className="pt-3">
                        <p className="text-[10px] text-muted-foreground">Tampilan demo antarmuka</p>
                        <p className="font-semibold text-sm text-foreground">Pengguna Contoh</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div
                          className="rounded-xl p-3 text-primary-foreground"
                          style={{
                            background: "linear-gradient(135deg, var(--gradient-mbanking-from) 0%, var(--gradient-mbanking-to) 100%)",
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-5 h-5 rounded bg-primary-foreground/20 flex items-center justify-center">
                              <Wallet className="w-3 h-3" />
                            </div>
                            <p className="text-[9px] font-medium">M-Banking</p>
                          </div>
                          <p className="text-[10px] opacity-80">Contoh saldo</p>
                          <p className="text-sm font-bold mt-0.5">Rp 320.000</p>
                        </div>

                        <div
                          className="rounded-xl p-3 text-primary-foreground"
                          style={{
                            background: "linear-gradient(135deg, var(--gradient-cash-from) 0%, var(--gradient-cash-to) 100%)",
                          }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-5 h-5 rounded bg-primary-foreground/20 flex items-center justify-center">
                              <Wallet className="w-3 h-3" />
                            </div>
                            <p className="text-[9px] font-medium">Cash</p>
                          </div>
                          <p className="text-[10px] opacity-80">Contoh saldo</p>
                          <p className="text-sm font-bold mt-0.5">Rp 85.000</p>
                        </div>
                      </div>

                      <div className="bg-card rounded-lg p-3 border border-border">
                        <p className="text-[10px] font-medium text-foreground mb-2">Ringkasan Bulanan</p>
                        <p className="text-[9px] text-muted-foreground mb-2">Contoh data bulan ini</p>
                        <div className="space-y-2">
                          <div className="bg-success/10 rounded-md p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-success" />
                              <span className="text-[10px] text-success-text">Pemasukan</span>
                            </div>
                            <span className="text-xs font-semibold text-success">+Rp 640.000</span>
                          </div>
                          <div className="bg-danger-bg rounded-md p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-3 h-3 text-danger rotate-180" />
                              <span className="text-[10px] text-danger-text">Pengeluaran</span>
                            </div>
                            <span className="text-xs font-semibold text-danger">-Rp 235.000</span>
                          </div>
                        </div>
                      </div>

                      <button className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-xs font-semibold">
                        Lihat Contoh Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
