"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Target, TrendingUp, Info } from "lucide-react"

const ROTATING_GOALS = ["Dana Darurat", "Liburan", "Tabungan", "Pendidikan", "Kendaraan", "Rumah"]

export function CtaSection() {
  const [currentGoalIndex, setCurrentGoalIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [targetAmount, setTargetAmount] = useState("10000000")
  const [monthlyAmount, setMonthlyAmount] = useState("1000000")

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentGoalIndex((prev) => (prev + 1) % ROTATING_GOALS.length)
        setIsAnimating(false)
      }, 300)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: string) => {
    const number = parseInt(value.replace(/\D/g, "")) || 0
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const value = e.target.value.replace(/\D/g, "")
    setter(value)
  }


  const targetNum = parseInt(targetAmount) || 0
  const monthlyNum = parseInt(monthlyAmount) || 1
  const monthsNeeded = Math.ceil(targetNum / monthlyNum)
  const yearsNeeded = Math.floor(monthsNeeded / 12)
  const remainingMonths = monthsNeeded % 12

  return (
    <section className="bg-card py-16 lg:py-24">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Simulasi Tabungan untuk{" "}
            <span
              className={`inline-block text-primary underline decoration-primary/50 decoration-4 underline-offset-4 transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
              }`}
            >
              {ROTATING_GOALS[currentGoalIndex]}
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            SIKAS membantu kamu merencanakan dan mencapai tujuan keuanganmu dengan lebih mudah.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-6">
              Yuk coba simulasikan tabungan kamu!
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Target Tabungan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(targetAmount)}
                    onChange={(e) => handleInputChange(e, setTargetAmount)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Target tabungan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Tabungan Bulanan
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(monthlyAmount)}
                    onChange={(e) => handleInputChange(e, setMonthlyAmount)}
                    className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Tabungan bulanan"
                  />
                </div>
              </div>

              <Button 
                className="w-full h-12 text-base font-semibold rounded-xl"
              >
                Hitung Simulasi
              </Button>
            </div>
          </div>

          <div className="bg-linear-to-br from-primary/5 to-primary/10 rounded-2xl p-6 lg:p-8 border border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hasil Simulasi</p>
                <p className="text-lg font-semibold text-foreground">Perkiraan Waktu</p>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 mb-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Target tercapai dalam</p>
                  <p className="text-3xl font-bold text-primary">
                    {yearsNeeded > 0 && `${yearsNeeded} tahun `}
                    {remainingMonths > 0 && `${remainingMonths} bulan`}
                    {monthsNeeded === 0 && "0 bulan"}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-success" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium text-foreground">0% → 100%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-primary to-success rounded-full transition-all duration-500"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Mulai</span>
                  <span>{monthsNeeded} bulan</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
              <div className="bg-card rounded-xl p-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">Total Tabungan</p>
                <p className="text-base sm:text-lg font-bold text-foreground truncate">{formatCurrency(targetAmount)}</p>
              </div>
              <div className="bg-card rounded-xl p-4">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 truncate">Per Bulan</p>
                <p className="text-base sm:text-lg font-bold text-primary truncate">{formatCurrency(monthlyAmount)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Simulasi ini hanya perkiraan dan dapat berbeda dengan hasil sebenarnya tergantung konsistensi menabung.</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Siap untuk mulai mencatat dan merencanakan keuanganmu?
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-base font-semibold gap-2 group rounded-full">
              Daftar Gratis Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
