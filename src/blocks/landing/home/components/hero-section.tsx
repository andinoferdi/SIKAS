"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet, TrendingUp, PieChart, Shield } from "lucide-react"

const ROTATING_WORDS = ["Keluarga", "Pribadi", "Bisnis", "Masa Depan"]

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-64px)] py-12 lg:py-0">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Kelola Keuangan{" "}
              <span className="block mt-2">
                untuk{" "}
                <span
                  className={`inline-block text-primary underline decoration-primary/50 decoration-4 underline-offset-4 transition-all duration-300 ${
                    isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  {ROTATING_WORDS[currentWordIndex]}
                </span>
              </span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Catat pengeluaran, kelola kategori, dan pahami pola keuangan Anda dengan antarmuka yang indah dan intuitif.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center lg:justify-start">
              <Link href="/register">
                <Button size="lg" className="font-medium px-8 gap-2 group">
                  Mulai Sekarang
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="font-medium px-8">
                  Masuk
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-2 justify-center lg:justify-start pt-4">
              <Shield className="w-5 h-5 text-success" />
              <span className="text-sm text-muted-foreground">Data aman & terenkripsi</span>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-primary/20 blur-3xl"></div>
            </div>

            <div className="relative z-10">
              <div className="relative w-64 sm:w-72 lg:w-80">
                <div className="bg-foreground rounded-[3rem] p-3 shadow-2xl shadow-foreground/20">
                  <div className="bg-muted rounded-[2.5rem] overflow-hidden">
                    <div className="bg-card px-6 py-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-foreground rounded-sm">
                          <div className="w-2.5 h-1 bg-foreground rounded-sm m-0.5"></div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-6 space-y-4">
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Selamat datang,</p>
                          <p className="font-semibold text-foreground">Pengguna</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-surface font-semibold text-sm">
                          P
                        </div>
                      </div>

                      <div className="rounded-2xl p-4 text-on-surface" style={{background: "linear-gradient(to bottom right, var(--gradient-mbanking-from), var(--gradient-mbanking-to))"}}>
                        <p className="text-xs opacity-80">Total Saldo</p>
                        <p className="text-2xl font-bold mt-1">Rp 5.250.000</p>
                        <div className="flex gap-4 mt-3">
                          <div>
                            <p className="text-xs opacity-80">M-Banking</p>
                            <p className="text-sm font-medium">Rp 4.000.000</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-80">Tunai</p>
                            <p className="text-sm font-medium">Rp 1.250.000</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-card rounded-xl p-3 border border-border">
                          <div className="w-8 h-8 rounded-lg bg-success-bg flex items-center justify-center mb-2">
                            <TrendingUp className="w-4 h-4 text-success" />
                          </div>
                          <p className="text-xs text-muted-foreground">Pemasukan</p>
                          <p className="font-semibold text-foreground text-sm">Rp 8.5jt</p>
                        </div>
                        <div className="bg-card rounded-xl p-3 border border-border">
                          <div className="w-8 h-8 rounded-lg bg-danger-bg flex items-center justify-center mb-2">
                            <Wallet className="w-4 h-4 text-danger" />
                          </div>
                          <p className="text-xs text-muted-foreground">Pengeluaran</p>
                          <p className="font-semibold text-foreground text-sm">Rp 3.2jt</p>
                        </div>
                      </div>

                      <div className="bg-card rounded-xl p-3 border border-border">
                        <p className="text-xs font-medium text-card-foreground mb-2">Transaksi Terakhir</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-warning-bg flex items-center justify-center">
                              <PieChart className="w-4 h-4 text-warning" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Makan</p>
                              <p className="text-xs text-muted-foreground">Hari ini</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-danger">-Rp 50.000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-8 top-1/4 bg-card rounded-xl p-3 shadow-lg border border-border hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Bulan ini</p>
                      <p className="text-sm font-semibold text-success">+12%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-card rounded-xl p-3 shadow-lg border border-border hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hemat</p>
                      <p className="text-sm font-semibold text-primary">Rp 2.3jt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="fitur" className="border-t border-border bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Fitur</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">Gratis</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Keamanan</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">Terenkripsi</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Antarmuka</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">Mudah</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Akses</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div id="tentang" className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Kenapa Pilih SIKAS?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Aplikasi keuangan sederhana yang membantu Anda mengelola uang dengan lebih baik
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-muted rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Catat Transaksi</h3>
              <p className="text-muted-foreground text-sm">
                Catat pemasukan dan pengeluaran dengan mudah dan cepat
              </p>
            </div>

            <div className="bg-muted rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-success-bg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-success" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Pantau Keuangan</h3>
              <p className="text-muted-foreground text-sm">
                Lihat ringkasan keuangan dan pahami pola pengeluaran Anda
              </p>
            </div>

            <div className="bg-muted rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-warning-bg flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-7 h-7 text-warning" />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">Kelola Kategori</h3>
              <p className="text-muted-foreground text-sm">
                Atur kategori sesuai kebutuhan untuk pencatatan yang rapi
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
