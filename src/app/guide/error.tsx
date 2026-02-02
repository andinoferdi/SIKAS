"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { ErrorProps } from "@/types"

export default function GuideError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Guide error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || "Tidak dapat memuat halaman panduan"}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Beranda
          </Link>
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    </div>
  )
}
