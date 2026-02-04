import type React from "react"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  variant: "bot" | "user"
  children: React.ReactNode
  className?: string
}

export function ChatBubble({ variant, children, className }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
        variant === "bot"
          ? "bg-muted text-card-foreground rounded-tl-sm"
          : "bg-primary text-on-surface rounded-tr-sm",
        className
      )}
    >
      {children}
    </div>
  )
}
