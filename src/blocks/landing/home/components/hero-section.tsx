"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

gsap.registerPlugin(ScrollTrigger)

const ROTATING_WORDS = ["Pribadi", "Keluarga", "Bisnis", "Masa Depan", "Semua"]

// Angka contoh yang sama dengan mockup lama, kini ditampilkan sebagai
// tipografi berukuran penuh, bukan UI yang disusutkan ke dalam bingkai HP.
const SAMPLE_MONTH = [
  { label: "Pemasukan", amount: 640000, tone: "text-success" },
  { label: "Pengeluaran", amount: -235000, tone: "text-danger" },
  { label: "Sisa", amount: 405000, tone: "text-foreground" },
]

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    signDisplay: "auto",
  }).format(value)

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const wordRef = useRef<HTMLSpanElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wordRef.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const timer = window.setInterval(() => {
        gsap.to(el, {
          opacity: 0,
          y: -8,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
            gsap.fromTo(
              el,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
            )
          },
        })
      }, 3000)

      return () => window.clearInterval(timer)
    })

    return () => mm.revert()
  }, [])

  useEffect(() => {
    const el = summaryRef.current
    if (!el) return

    const mm = gsap.matchMedia()

    // Pin hanya di layar lebar. Di mobile dan tablet blok ini mengalir
    // normal, karena menahan konten di layar kecil membuat scroll terasa
    // macet.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 20%",
        end: "+=160",
        pin: true,
        pinSpacing: false,
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <h1 className="font-bold tracking-tight text-display text-foreground">
              Kelola keuangan
              <br />
              untuk{" "}
              <span ref={wordRef} className="inline-block text-primary">
                {ROTATING_WORDS[wordIndex]}
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Catat pengeluaran dan pemasukan dengan mudah. Kelola keuangan untuk masa depan
              yang lebih baik.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 rounded-full px-8 text-base font-semibold sm:w-auto"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base font-semibold sm:w-auto"
                >
                  Masuk
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                Data Terenkripsi
              </span>
              <span>100% Gratis</span>
            </div>
          </div>

          <div
            ref={summaryRef}
            className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0"
          >
            <p className="text-sm text-muted-foreground">Contoh ringkasan bulan ini</p>
            <dl className="mt-6 flex flex-col">
              {SAMPLE_MONTH.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between border-b border-border py-4 last:border-b-0"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className={`text-2xl font-semibold tabular-nums ${row.tone}`}>
                    {rupiah(row.amount)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
