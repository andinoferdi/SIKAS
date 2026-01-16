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
    <section className="relative overflow-hidden bg-white">
      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[calc(100vh-64px)] py-12 lg:py-0">
          {/* Left - Text Content */}
          <div className="flex flex-col gap-6 text-center lg:text-left">
            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-neutral-900">
              Kelola Keuangan{" "}
              <span className="block mt-2">
                untuk{" "}
                <span
                  className={`inline-block text-sky-500 underline decoration-sky-300 decoration-4 underline-offset-4 transition-all duration-300 ${
                    isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
                  }`}
                >
                  {ROTATING_WORDS[currentWordIndex]}
                </span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Catat pengeluaran, kelola kategori, dan pahami pola keuangan Anda dengan antarmuka yang indah dan intuitif.
            </p>

            {/* CTA Buttons */}
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

            {/* Trust Badge */}
            <div className="flex items-center gap-2 justify-center lg:justify-start pt-4">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-neutral-500">Data aman & terenkripsi</span>
            </div>
          </div>

          {/* Right - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Decorative background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-sky-100/50 blur-3xl"></div>
            </div>

            {/* Phone Frame */}
            <div className="relative z-10">
              <div className="relative w-64 sm:w-72 lg:w-80">
                {/* Phone outer frame */}
                <div className="bg-neutral-900 rounded-[3rem] p-3 shadow-2xl shadow-neutral-900/20">
                  {/* Phone screen */}
                  <div className="bg-neutral-50 rounded-[2.5rem] overflow-hidden">
                    {/* Status bar */}
                    <div className="bg-white px-6 py-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-900">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-neutral-900 rounded-sm">
                          <div className="w-2.5 h-1 bg-neutral-900 rounded-sm m-0.5"></div>
                        </div>
                      </div>
                    </div>

                    {/* App content mockup */}
                    <div className="px-4 pb-6 space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <p className="text-xs text-neutral-500">Selamat datang,</p>
                          <p className="font-semibold text-neutral-900">Pengguna</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold text-sm">
                          P
                        </div>
                      </div>

                      {/* Balance Card */}
                      <div className="bg-linear-to-br from-sky-500 to-sky-600 rounded-2xl p-4 text-white">
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

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-xl p-3 border border-neutral-100">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-xs text-neutral-500">Pemasukan</p>
                          <p className="font-semibold text-neutral-900 text-sm">Rp 8.5jt</p>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-neutral-100">
                          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center mb-2">
                            <Wallet className="w-4 h-4 text-red-600" />
                          </div>
                          <p className="text-xs text-neutral-500">Pengeluaran</p>
                          <p className="font-semibold text-neutral-900 text-sm">Rp 3.2jt</p>
                        </div>
                      </div>

                      {/* Recent Transaction */}
                      <div className="bg-white rounded-xl p-3 border border-neutral-100">
                        <p className="text-xs font-medium text-neutral-700 mb-2">Transaksi Terakhir</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                              <PieChart className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-neutral-900">Makan</p>
                              <p className="text-xs text-neutral-500">Hari ini</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-red-500">-Rp 50.000</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -left-8 top-1/4 bg-white rounded-xl p-3 shadow-lg border border-neutral-100 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Bulan ini</p>
                      <p className="text-sm font-semibold text-green-600">+12%</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl p-3 shadow-lg border border-neutral-100 hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Hemat</p>
                      <p className="text-sm font-semibold text-sky-600">Rp 2.3jt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="fitur" className="border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Fitur</p>
              <p className="text-2xl sm:text-3xl font-bold text-sky-500">Gratis</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Keamanan</p>
              <p className="text-2xl sm:text-3xl font-bold text-sky-500">Terenkripsi</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Antarmuka</p>
              <p className="text-2xl sm:text-3xl font-bold text-sky-500">Mudah</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-neutral-500 mb-1">Akses</p>
              <p className="text-2xl sm:text-3xl font-bold text-sky-500">24/7</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="tentang" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
              Kenapa Pilih SIKAS?
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Aplikasi keuangan sederhana yang membantu Anda mengelola uang dengan lebih baik
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-neutral-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">Catat Transaksi</h3>
              <p className="text-neutral-600 text-sm">
                Catat pemasukan dan pengeluaran dengan mudah dan cepat
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">Pantau Keuangan</h3>
              <p className="text-neutral-600 text-sm">
                Lihat ringkasan keuangan dan pahami pola pengeluaran Anda
              </p>
            </div>

            <div className="bg-neutral-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg text-neutral-900 mb-2">Kelola Kategori</h3>
              <p className="text-neutral-600 text-sm">
                Atur kategori sesuai kebutuhan untuk pencatatan yang rapi
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
