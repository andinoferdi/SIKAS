"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { userService } from "@/services"

interface HeaderProps {
  userName: string
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await userService.logout()
      router.push("/login")
    } catch {
      setLoading(false)
    }
  }

  return (
    <header className="flex items-center justify-between mb-8 pb-6 border-b border-border">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Halo,</p>
        <h1 className="text-2xl font-bold text-foreground mt-1">{userName}</h1>
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="p-2.5 rounded-lg hover:bg-muted active:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
        title="Logout"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      </button>
    </header>
  )
}
