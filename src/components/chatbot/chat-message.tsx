"use client"

import { type Message } from "@/types/chatbot"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isBot
            ? "bg-sky-500 text-white"
            : "bg-neutral-200 text-neutral-600"
        )}
      >
        {isBot ? (
          <Bot className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isBot
            ? "bg-neutral-100 text-neutral-800 rounded-tl-sm"
            : "bg-sky-500 text-white rounded-tr-sm"
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 -mb-0.5" />
        )}
      </div>
    </div>
  )
}
