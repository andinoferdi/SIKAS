"use client"

import { MessageCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatbotButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function ChatbotButton({ isOpen, onClick }: ChatbotButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 sm:right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 cursor-pointer",
        isOpen
          ? "bg-foreground hover:bg-card-foreground rotate-0"
          : "bg-primary hover:bg-primary/90 hover:scale-110"
      )}
      aria-label={isOpen ? "Tutup chat" : "Buka chat"}
    >
      {isOpen ? (
        <X className="w-6 h-6 text-on-surface" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6 text-on-surface" />
          <span className="absolute w-full h-full rounded-full bg-primary animate-ping opacity-30" />
        </>
      )}
    </button>
  )
}
