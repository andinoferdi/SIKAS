import { User } from "@/types"

interface LoginResponse {
  success: boolean
  user?: { id: string; name: string }
  error?: string
}

interface UserResponse {
  user?: User
  error?: string
}

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const res = await fetch("/api/auth/me")
      const data: UserResponse = await res.json()
      return data.user || null
    } catch {
      return null
    }
  },

  async login(userName: string, pin: string): Promise<LoginResponse> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error }
      }
      return { success: true, user: data.user }
    } catch {
      return { success: false, error: "Terjadi kesalahan" }
    }
  },

  async logout(): Promise<boolean> {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      return true
    } catch {
      return false
    }
  },
}
