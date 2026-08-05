"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/hooks"
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"

/* eslint-disable react-hooks/incompatible-library */
export default function RegisterPage() {
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const router = useRouter()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const pinValue = watch("pin")
  const confirmPinValue = watch("confirmPin")
  const pinMatches = Boolean(confirmPinValue) && pinValue === confirmPinValue

  const onSubmit = (data: RegisterFormData) => {
    registerMutation.mutate(
      { name: data.name.trim(), pin: data.pin },
      {
        onSuccess: () => {
          toast.success(`Selamat datang, ${data.name}!`)
          router.push("/dashboard")
        },
        onError: (error) => {
          const errorMessage = error.message || "Terjadi kesalahan"
          setFormError("root", { message: errorMessage })
          toast.error(errorMessage)
        },
      }
    )
  }

  const onlyDigits = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6)
  }

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-8 md:px-8 md:py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke beranda
        </Link>

        <div className="grid flex-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-md">
            <h1 className="text-h2 font-bold tracking-tight text-foreground">
              Buat akun SIKAS
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Cukup nama dan PIN. Tanpa email, tanpa biaya, dan datamu tersimpan terenkripsi.
            </p>
          </div>

          <div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Nama
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama kamu"
                  autoFocus
                  autoComplete="username"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  className="h-12 rounded-lg"
                  {...register("name")}
                />
                {errors.name ? (
                  <p id="name-error" role="alert" className="text-sm text-danger">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="pin" className="text-sm font-medium text-foreground">
                  PIN
                </label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="4 sampai 6 digit"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.pin)}
                    aria-describedby={errors.pin ? "pin-error" : "pin-help"}
                    className="h-12 rounded-lg pr-12 tracking-widest tabular-nums"
                    {...register("pin")}
                    onChange={(event) => {
                      onlyDigits(event)
                      register("pin").onChange(event)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((shown) => !shown)}
                    aria-label={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPin ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.pin ? (
                  <p id="pin-error" role="alert" className="text-sm text-danger">
                    {errors.pin.message}
                  </p>
                ) : (
                  <p id="pin-help" className="text-sm text-muted-foreground">
                    PIN dipakai setiap kali masuk. Pilih yang mudah kamu ingat.
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPin" className="text-sm font-medium text-foreground">
                  Ulangi PIN
                </label>
                <div className="relative">
                  <Input
                    id="confirmPin"
                    type={showConfirmPin ? "text" : "password"}
                    placeholder="Ketik ulang PIN kamu"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.confirmPin)}
                    aria-describedby={errors.confirmPin ? "confirm-error" : "confirm-status"}
                    className="h-12 rounded-lg pr-12 tracking-widest tabular-nums"
                    {...register("confirmPin")}
                    onChange={(event) => {
                      onlyDigits(event)
                      register("confirmPin").onChange(event)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin((shown) => !shown)}
                    aria-label={showConfirmPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showConfirmPin ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.confirmPin ? (
                  <p id="confirm-error" role="alert" className="text-sm text-danger">
                    {errors.confirmPin.message}
                  </p>
                ) : confirmPinValue ? (
                  <p
                    id="confirm-status"
                    aria-live="polite"
                    className={`text-sm ${pinMatches ? "text-success" : "text-danger"}`}
                  >
                    {pinMatches ? "PIN cocok" : "PIN belum cocok"}
                  </p>
                ) : null}
              </div>

              {errors.root ? (
                <p role="alert" className="border-l-2 border-danger py-1 pl-3 text-sm text-danger">
                  {errors.root.message}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                disabled={registerMutation.isPending}
                className="h-12 rounded-lg text-base font-semibold"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Mendaftarkan
                  </>
                ) : (
                  "Daftar"
                )}
              </Button>
            </form>

            <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
