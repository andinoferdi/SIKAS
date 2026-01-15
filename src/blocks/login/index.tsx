"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
      setError(result.error || "Terjadi kesalahan")
      setLoading(false)
      return
    }

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
    <div className="min-h-screen flex items-center justify-center bg-background-secondary p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-3xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary">
              Keuangan Kita
            </h1>
            <p className="text-text-muted mt-1">
              Kelola keuangan bersama
            </p>
          </div>

          {!selectedUser ? (
            <div className="space-y-4">
              <p className="text-center text-text-secondary text-sm">
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
                className="text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                ← Ganti akun
              </button>

              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-semibold text-text-secondary">
                    {selectedUser[0]}
                  </span>
                </div>
                <p className="text-lg font-medium text-text-primary">
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
                <p className="text-xs text-text-muted text-center mt-2">
                  PIN 4-6 digit
                </p>
              </div>

              {error && (
                <p className="text-danger text-sm text-center">{error}</p>
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
