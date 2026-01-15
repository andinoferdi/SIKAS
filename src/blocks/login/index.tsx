"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

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

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: selectedUser, pin }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Keuangan Kita
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Kelola keuangan bersama
            </p>
          </div>

          {!selectedUser ? (
            <div className="space-y-4">
              <p className="text-center text-zinc-600 dark:text-zinc-400 text-sm">
                Pilih akun Anda
              </p>
              {USERS.map((user) => (
                <Button
                  key={user}
                  onClick={() => setSelectedUser(user)}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
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
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              >
                ← Ganti akun
              </button>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300">
                    {selectedUser[0]}
                  </span>
                </div>
                <p className="text-lg font-medium text-zinc-900 dark:text-white">
                  {selectedUser}
                </p>
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Masukkan PIN"
                  value={pin}
                  onChange={handlePinChange}
                  onKeyDown={handleKeyDown}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center mt-2">
                  PIN 4-6 digit
                </p>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
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
      </div>
    </div>
  )
}
