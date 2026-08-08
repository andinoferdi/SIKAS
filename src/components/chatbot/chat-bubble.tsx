import type React from "react"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  variant: "bot" | "user"
  children: React.ReactNode
  className?: string
}

/*
  Kedua varian memakai teks gelap. Versi lama menaruh teks putih di atas
  biru cerah, yang untuk satu paragraf penuh hanya mencapai rasio 2,77:1
  dan berat dibaca. Pembeda pengguna kini latar biru muda, bukan biru pekat.
*/
export function ChatBubble({ variant, children, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-lg border px-4 py-3 text-base leading-relaxed text-foreground",
        variant === "bot" ? "border-border bg-muted" : "border-info-light/40 bg-info-bg",
        className
      )}
    >
      {children}
    </div>
  )
}
