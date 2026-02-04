"use client"

import { useEffect } from "react"
import Link from "next/link"
import type { ErrorProps } from "@/types"

export default function TransactionsError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Transactions error:", error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-lg font-semibold text-foreground">Terjadi Kesalahan</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "Tidak dapat memuat transaksi"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
