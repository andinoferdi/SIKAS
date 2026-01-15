"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { userService } from "@/service"

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-sidebar via-background to-secondary p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 sm:p-10">



          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
               <Image src="/images/logo.png" alt="SIKAS" width={64} height={64} className="h-16 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SIKAS</h1>
            <p className="text-neutral-600 mt-1 text-sm">Kelola keuangan bersama</p>
          </div>

          {!selectedUser ? (
            <div className="space-y-4">
              <p className="text-center text-neutral-700 text-sm font-medium mb-6">Pilih akun Anda</p>
              {USERS.map((user) => (
                <Button key={user} onClick={() => setSelectedUser(user)} variant="outline" size="lg" className="w-full">
                  {user}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setPin("")
                  setError("")
                }}
                className="text-sm text-neutral-600 hover:text-foreground transition-colors font-medium"
              >
                ← Ganti akun
              </button>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-linear-to-br from-sky-300 to-sky-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <span className="text-2xl font-bold text-white">{selectedUser[0]}</span>
                </div>
                <p className="text-xl font-semibold text-foreground">{selectedUser}</p>
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="••••••"
                  value={pin}
                  onChange={handlePinChange}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                  className="text-center text-3xl tracking-widest font-semibold"
                  autoFocus
                />
                <p className="text-xs text-neutral-600 text-center mt-3">PIN 4-6 digit</p>
              </div>

              {error && (
                <p className="text-danger-text text-sm text-center font-medium bg-danger-bg rounded-lg py-2">{error}</p>
              )}

              <Button
                onClick={handleLogin}
                disabled={pin.length < 4 || loading}
                size="lg"
                className="w-full"
              >
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-neutral-600 mt-6">Akses aman untuk data keuangan Anda</p>
      </div>
    </div>
  )
}
  