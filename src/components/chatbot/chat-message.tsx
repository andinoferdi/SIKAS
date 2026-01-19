"use client"

import { memo } from "react"
import ReactMarkdown from "react-markdown"
import { type Message } from "@/types/chatbot"
import { Bot, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: Message
}

// Memoized markdown component for better streaming performance
const MemoizedMarkdown = memo(
  ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        // Custom styling for markdown elements
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="ml-2">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-black/10 dark:bg-white/10 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  ),
  (prevProps, nextProps) => prevProps.content === nextProps.content
)

MemoizedMarkdown.displayName = "MemoizedMarkdown"

export function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === "assistant"

  return (
    <div
      className={cn(
        "flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
        isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isBot
            ? "bg-primary text-on-surface"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isBot ? (
          <Bot className="w-4 h-4" />
        ) : (
          <User className="w-4 h-4" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isBot
            ? "bg-muted text-card-foreground rounded-tl-sm"
            : "bg-primary text-on-surface rounded-tr-sm"
        )}
      >
        {isBot ? (
          <div className="wrap-break-word">
            <MemoizedMarkdown content={message.content} />
          </div>
        ) : (
          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        )}
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-current animate-pulse ml-0.5 -mb-0.5" />
        )}
      </div>
    </div>
  )
}
