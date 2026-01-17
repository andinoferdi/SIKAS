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
import { Loader2, Eye, EyeOff, ArrowLeft, User, Lock, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const validateName = (value: string) => {
    if (value.length < 2) return "Nama minimal 2 karakter"
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Nama hanya boleh huruf dan spasi"
    return ""
  }

  const validatePin = (value: string) => {
    if (value.length < 4) return "PIN minimal 4 digit"
    if (value.length > 6) return "PIN maksimal 6 digit"
    return ""
  }

  const handleRegister = async () => {
    setError("")

    // Validate name
    const nameError = validateName(name)
    if (nameError) {
      setError(nameError)
      toast.error(nameError)
      return
    }

    // Validate PIN
    const pinError = validatePin(pin)
    if (pinError) {
      setError(pinError)
      toast.error(pinError)
      return
    }

    // Validate confirm PIN
    if (pin !== confirmPin) {
      setError("PIN tidak cocok")
      toast.error("PIN tidak cocok")
      return
    }

    setLoading(true)

    const result = await userService.register(name.trim(), pin)

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
    const value = e.target.value
    setName(value)
    if (error) setError("")
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setPin(value)
    if (error) setError("")
  }

  const handleConfirmPinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setConfirmPin(value)
    if (error) setError("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.length >= 2 && pin.length >= 4 && confirmPin.length >= 4) {
      handleRegister()
    }
  }

  const isFormValid = name.length >= 2 && pin.length >= 4 && confirmPin.length >= 4 && pin === confirmPin

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
          <h1 className="text-2xl font-bold text-neutral-900">Buat Akun SIKAS</h1>
          <p className="text-neutral-500 mt-1 text-sm">Daftar untuk mulai mengelola keuangan Anda</p>
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
                {name.length >= 2 && /^[a-zA-Z\s]+$/.test(name) && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              <p className="text-xs text-neutral-500">Minimal 2 karakter, hanya huruf dan spasi</p>
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
              <p className="text-xs text-neutral-500">PIN harus 4-6 digit angka</p>
            </div>

            {/* Confirm PIN Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">Konfirmasi PIN</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <Input
                  type={showConfirmPin ? "text" : "password"}
                  placeholder="Masukkan ulang PIN"
                  value={confirmPin}
                  onChange={handleConfirmPinChange}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                  className="pl-11 pr-11 h-12 tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPin(!showConfirmPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
                >
                  {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPin.length > 0 && (
                <p className={`text-xs ${pin === confirmPin ? "text-green-500" : "text-red-500"}`}>
                  {pin === confirmPin ? "PIN cocok" : "PIN tidak cocok"}
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Register Button */}
            <Button
              onClick={handleRegister}
              disabled={!isFormValid || loading}
              size="lg"
              className="w-full h-12 text-base font-medium mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Mendaftarkan...
                </>
              ) : (
                "Daftar"
              )}
            </Button>
          </div>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-sky-500 font-medium hover:text-sky-600 transition-colors">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
