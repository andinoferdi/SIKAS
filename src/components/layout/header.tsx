"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  userName: string
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/login")
    } catch {
      setLoading(false)
    }
  }

  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">Halo,</p>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
          {userName}
        </h1>
      </div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
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
