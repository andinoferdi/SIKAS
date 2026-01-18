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
import { useLogin } from "@/hooks"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { Loader2, Eye, EyeOff, ArrowLeft, User, Lock } from "lucide-react"

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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Image
              src="/images/logo.png"
              alt="SIKAS"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Masuk ke SIKAS</h1>
          <p className="text-muted-foreground mt-1 text-sm">Masukkan nama dan PIN Anda</p>
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
              </div>
              {errors.name && (
                <p className="text-sm text-danger-text">{errors.name.message}</p>
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
              {errors.pin && (
                <p className="text-sm text-danger-text">{errors.pin.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="flex items-center gap-2 p-3 bg-danger-bg border border-danger-border rounded-xl">
                <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
                <p className="text-sm text-danger-text">{errors.root.message}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              size="lg"
              className="w-full h-12 text-base font-medium mt-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary font-medium hover:text-primary/80 transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
