"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { userService } from "@/services"
import { Loader2, Eye, EyeOff, ArrowLeft, User, Lock } from "lucide-react"

export default function LoginPage() {
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!name.trim() || !pin) return

    setLoading(true)
    setError("")

    const result = await userService.login(name.trim(), pin)

    if (!result.success) {
      const errorMessage = result.error || "Terjadi kesalahan"
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
      return
    }

    toast.success(`Selamat datang, ${name}!`)
    router.push("/dashboard")
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (error) setError("")
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setPin(value)
    if (error) setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim().length >= 2 && pin.length >= 4) {
      handleLogin()
    }
  }

  const isFormValid = name.trim().length >= 2 && pin.length >= 4

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-500 mb-4">
            <Image
              src="/images/logo.png"
              alt="SIKAS"
              width={40}
              height={40}
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Masuk ke SIKAS</h1>
          <p className="text-neutral-500 mt-1 text-sm">Masukkan nama dan PIN Anda</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
          <div className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Nama</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Masukkan nama Anda"
                  value={name}
                  onChange={handleNameChange}
                  onKeyDown={handleKeyDown}
                  className="pl-11 h-12"
                  autoFocus
                />
              </div>
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">PIN</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type={showPin ? "text" : "password"}
                  placeholder="Masukkan PIN (4-6 digit)"
                  value={pin}
                  onChange={handlePinChange}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                  className="pl-11 pr-11 h-12 tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={!isFormValid || loading}
              size="lg"
              className="w-full h-12 text-base font-medium mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Belum punya akun?{" "}
          <Link href="/register" className="text-sky-500 font-medium hover:text-sky-600 transition-colors">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
