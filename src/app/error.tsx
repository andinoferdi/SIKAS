"use client"

import { useEffect } from "react"
import Link from "next/link"
import type { ErrorProps } from "@/types"

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Root error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Terjadi Kesalahan</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "Tidak dapat memuat aplikasi"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
