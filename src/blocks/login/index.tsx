"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { userService } from "@/service"
import { ChevronLeft, Loader2 } from "lucide-react"

const USERS = ["Andino", "Sayu"] as const

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!selectedUser || !pin) return

    setLoading(true)
    setError("")

    const result = await userService.login(selectedUser, pin)

    if (!result.success) {
      const errorMessage = result.error || "Terjadi kesalahan"
      setError(errorMessage)
      toast.error(errorMessage)
      setLoading(false)
      return
    }

    toast.success(`Selamat datang, ${selectedUser}!`)
    router.push("/dashboard")
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setPin(value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length >= 4) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
      <div className="w-full max-w-100">
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
          <h1 className="text-2xl font-bold text-neutral-900">SIKAS</h1>
          <p className="text-neutral-500 mt-1 text-sm">Kelola keuangan bersama</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sm:p-8">
          {!selectedUser ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Pilih Akun</h2>
                <p className="text-sm text-neutral-500 mt-1">Masuk dengan akun Anda</p>
              </div>

              <div className="space-y-3">
                {USERS.map((user) => (
                  <button
                    key={user}
                    onClick={() => setSelectedUser(user)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-neutral-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-lg font-semibold shrink-0">
                      {user[0]}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-neutral-900 group-hover:text-sky-700 transition-colors">
                        {user}
                      </p>
                      <p className="text-sm text-neutral-500">Akun Personal</p>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-neutral-400 rotate-180 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setPin("")
                  setError("")
                }}
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Ganti akun
              </button>

              {/* User Avatar */}
              <div className="text-center py-2">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-sky-500/20">
                  <span className="text-3xl font-bold text-white">{selectedUser[0]}</span>
                </div>
                <p className="text-xl font-semibold text-neutral-900">{selectedUser}</p>
              </div>

              {/* PIN Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">Masukkan PIN</label>
                <Input
                  type="password"
                  placeholder="------"
                  value={pin}
                  onChange={handlePinChange}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                  className="text-center text-2xl tracking-[0.5em] font-semibold h-14"
                  autoFocus
                />
                <p className="text-xs text-neutral-500 text-center">PIN 4-6 digit</p>
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
                disabled={pin.length < 4 || loading}
                size="lg"
                className="w-full h-12 text-base font-medium"
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
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-neutral-400 mt-6">
          Akses aman untuk data keuangan Anda
        </p>
      </div>
    </div>
  )
}
