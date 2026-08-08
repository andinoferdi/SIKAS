"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/hooks"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const [showPin, setShowPin] = useState(false)
  const router = useRouter()
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(
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
              Masuk ke SIKAS
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Masukkan nama dan PIN kamu untuk melanjutkan mencatat keuangan.
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
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.pin)}
                    aria-describedby={errors.pin ? "pin-error" : undefined}
                    className="h-12 rounded-lg pr-12 tracking-widest tabular-nums"
                    {...register("pin")}
                    onChange={(event) => {
                      event.target.value = event.target.value.replace(/\D/g, "").slice(0, 6)
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
                disabled={loginMutation.isPending}
                className="h-12 rounded-lg text-base font-semibold"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Memproses
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            <p className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
