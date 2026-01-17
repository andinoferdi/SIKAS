"use client"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="p-4 lg:p-6 min-h-screen flex items-center justify-center pb-24 lg:pb-6">
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Terjadi Kesalahan
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || "Tidak dapat memuat dashboard"}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  )
}
