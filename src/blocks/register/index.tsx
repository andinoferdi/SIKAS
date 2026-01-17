"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRegister } from "@/hooks"
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { Loader2, Eye, EyeOff, ArrowLeft, User, Lock, CheckCircle2 } from "lucide-react"

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

  const nameValue = watch("name")
  const pinValue = watch("pin")
  const confirmPinValue = watch("confirmPin")

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <Image
              src="/images/logo.png"
              alt="SIKAS"
              width={40}
              height={40}
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Buat Akun SIKAS</h1>
          <p className="text-muted-foreground mt-1 text-sm">Daftar untuk mulai mengelola keuangan Anda</p>
        </div>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Nama</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Masukkan nama Anda"
                  {...register("name")}
                  className="pl-11 h-12"
                  autoFocus
                />
                {nameValue && nameValue.length >= 2 && /^[a-zA-Z\s]+$/.test(nameValue) && !errors.name && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
                )}
              </div>
              {errors.name ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Minimal 2 karakter, hanya huruf dan spasi</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">PIN</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="Masukkan PIN (4-6 digit)"
                  {...register("pin")}
                  maxLength={6}
                  className="pl-11 pr-11 h-12 tracking-widest"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    register("pin").onChange(e)
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.pin ? (
                <p className="text-xs text-destructive">{errors.pin.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">PIN harus 4-6 digit angka</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-card-foreground">Konfirmasi PIN</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showConfirmPin ? "text" : "password"}
                  placeholder="Masukkan ulang PIN"
                  {...register("confirmPin")}
                  maxLength={6}
                  className="pl-11 pr-11 h-12 tracking-widest"
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    register("confirmPin").onChange(e)
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPin ? (
                <p className="text-xs text-destructive">{errors.confirmPin.message}</p>
              ) : confirmPinValue && confirmPinValue.length > 0 ? (
                <p className={`text-xs ${pinValue === confirmPinValue ? "text-success" : "text-destructive"}`}>
                  {pinValue === confirmPinValue ? "PIN cocok" : "PIN tidak cocok"}
                </p>
              ) : null}
            </div>

            {errors.root && (
              <div className="p-3 bg-danger-bg border border-danger-border rounded-xl">
                <p className="text-sm text-danger-text">{errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={registerMutation.isPending}
              size="lg"
              className="w-full h-12 text-base font-medium mt-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
