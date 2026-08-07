"use client"

import { MessageCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatbotButtonProps {
  isOpen: boolean
  onClick: () => void
}

/*
  Posisi mobile menghitung tinggi bottom nav (64px) ditambah safe area dan
  jarak 16px, supaya tombol tidak pernah tertimpa nav di perangkat dengan
  home indicator. Tepi kanannya disamakan dengan panel agar sejajar.

  Halo animate-ping yang berdenyut tanpa henti dibuang. Denyut permanen
  menarik perhatian terus-menerus tanpa menyampaikan informasi apa pun,
  dan bertentangan dengan aturan motion di docs/fe-rules.md yang meminta
  gerak yang singkat dan fungsional.
*/
export function ChatbotButton({ isOpen, onClick }: ChatbotButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Tutup chat" : "Buka chat"}
      aria-expanded={isOpen}
      className={cn(
        "fixed z-50 flex h-14 w-14 items-center justify-center rounded-full transition-colors",
        "bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+1rem)] right-4",
        "sm:bottom-4 sm:right-4",
        isOpen
          ? "hidden bg-foreground text-background hover:bg-neutral-800 lg:flex"
          : "bg-primary text-primary-foreground hover:bg-btn-primary-hover"
      )}
    >
      {isOpen ? (
        <X className="h-6 w-6" aria-hidden="true" />
      ) : (
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      )}
    </button>
  )
}
