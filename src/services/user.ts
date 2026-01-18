import { fetcher } from "@/services/base"
import type { User, AuthResponse, UserResponse } from "@/types"

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const data = await fetcher<UserResponse>("/api/auth/me")
    return data.user || null
  },

  async login(userName: string, pin: string): Promise<{ id: string; name: string }> {
    const data = await fetcher<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ name: userName, pin }),
    })
    return data.user
  },

  async register(name: string, pin: string): Promise<{ id: string; name: string }> {
    const data = await fetcher<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, pin }),
    })
    return data.user
  },

  async logout(): Promise<void> {
    await fetcher<{ success: boolean }>("/api/auth/logout", { method: "POST" })
  },
}
