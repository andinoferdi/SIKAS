"use client"

import { useState } from "react"
import { Reveal } from "@/components/scroll"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

const MIN_TARGET = 10000
const MIN_MONTHLY = 10000

type Result = {
  months: number
  total: number
  monthly: number
}

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

const digitsOnly = (value: string) => value.replace(/\D/g, "")

const describeDuration = (months: number) => {
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} bulan`
  if (rest === 0) return `${years} tahun`
  return `${years} tahun ${rest} bulan`
}

export function SavingsSimulator() {
  const [target, setTarget] = useState("10000000")
  const [monthly, setMonthly] = useState("1000000")
  const [errors, setErrors] = useState<{ target?: string; monthly?: string }>({})
  const [result, setResult] = useState<Result | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const targetNum = Number(target)
    const monthlyNum = Number(monthly)
    const nextErrors: { target?: string; monthly?: string } = {}

    if (!targetNum || targetNum < MIN_TARGET) {
      nextErrors.target = `Target tabungan minimal ${rupiah(MIN_TARGET)}.`
    }
    if (!monthlyNum || monthlyNum < MIN_MONTHLY) {
      nextErrors.monthly = `Tabungan bulanan minimal ${rupiah(MIN_MONTHLY)}.`
    }
    if (!nextErrors.monthly && monthlyNum > targetNum) {
      nextErrors.monthly = "Tabungan bulanan tidak boleh melebihi target."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setResult(null)
      return
    }

    setIsCalculating(true)
    setResult({
      months: Math.ceil(targetNum / monthlyNum),
      total: targetNum,
      monthly: monthlyNum,
    })
    setIsCalculating(false)
  }

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="font-bold tracking-tight text-h2 text-foreground">
            Yuk coba simulasikan tabungan kamu
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            SIKAS membantu kamu merencanakan dan mencapai tujuan keuanganmu dengan lebih
            mudah.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="target" className="text-sm font-medium text-foreground">
                Target Tabungan
              </label>
              <input
                id="target"
                name="target"
                type="text"
                inputMode="numeric"
                value={rupiah(Number(target) || 0)}
                onChange={(event) => setTarget(digitsOnly(event.target.value))}
                aria-invalid={Boolean(errors.target)}
                aria-describedby={errors.target ? "target-error" : undefined}
                className="h-12 rounded-lg border border-border bg-input px-4 text-base tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring-focus"
              />
              {errors.target ? (
                <p id="target-error" role="alert" className="text-sm text-danger">
                  {errors.target}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="monthly" className="text-sm font-medium text-foreground">
                Tabungan Bulanan
              </label>
              <input
                id="monthly"
                name="monthly"
                type="text"
                inputMode="numeric"
                value={rupiah(Number(monthly) || 0)}
                onChange={(event) => setMonthly(digitsOnly(event.target.value))}
                aria-invalid={Boolean(errors.monthly)}
                aria-describedby={errors.monthly ? "monthly-error" : undefined}
                className="h-12 rounded-lg border border-border bg-input px-4 text-base tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring-focus"
              />
              {errors.monthly ? (
                <p id="monthly-error" role="alert" className="text-sm text-danger">
                  {errors.monthly}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isCalculating}
              className="h-12 rounded-lg text-base font-semibold"
            >
              {isCalculating ? "Menghitung" : "Hitung Simulasi"}
            </Button>
          </form>

          <div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <p className="text-sm text-muted-foreground">Hasil simulasi</p>

            {result ? (
              <div aria-live="polite">
                <p className="mt-2 font-bold tracking-tight text-h2 text-primary">
                  {describeDuration(result.months)}
                </p>
                <dl className="mt-8 flex flex-col">
                  <div className="flex items-baseline justify-between border-b border-border py-4">
                    <dt className="text-sm text-muted-foreground">Total tabungan</dt>
                    <dd className="text-lg font-semibold tabular-nums text-foreground">
                      {rupiah(result.total)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-border py-4">
                    <dt className="text-sm text-muted-foreground">Per bulan</dt>
                    <dd className="text-lg font-semibold tabular-nums text-foreground">
                      {rupiah(result.monthly)}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="mt-2 text-base text-muted-foreground">
                Isi target dan tabungan bulanan, lalu tekan Hitung Simulasi untuk melihat
                perkiraan waktunya.
              </p>
            )}

            <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Simulasi ini hanya perkiraan dan dapat berbeda dengan hasil sebenarnya
              tergantung konsistensi menabung.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
