import { memo } from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { type Message } from "@/types/chatbot"
import { Bot, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatBubble } from "@/components/chatbot/chat-bubble"

interface ChatMessageProps {
  message: Message
}

const MemoizedMarkdown = memo(
  ({ content }: { content: string }) => (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="ml-2">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="bg-muted p-2 rounded text-sm font-mono overflow-x-auto mb-2">
            {children}
          </pre>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="my-2 w-full overflow-y-auto">
            <table className="w-full text-sm border-collapse border border-border">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-muted/50">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody>
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
            {children}
          </tr>
        ),
        th: ({ children }) => (
          <th className="px-3 py-2 text-left font-medium text-muted-foreground border-r border-border last:border-0">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border-r border-border last:border-0 align-top">
            {children}
          </td>
        ),
      }}
      remarkPlugins={[remarkGfm]}
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

      <ChatBubble variant={isBot ? "bot" : "user"}>
        {message.imageUrl && (
          <div className="mb-2">
            <Image
              src={message.imageUrl}
              alt="Gambar yang dikirim"
              width={200}
              height={150}
              className="rounded-lg max-w-full h-auto object-cover"
              unoptimized
            />
          </div>
        )}
        {isBot ? (
          <div className="wrap-break-word">
            {message.isStreaming && !message.content ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-muted-foreground">Memproses permintaan...</span>
              </div>
            ) : (
              <MemoizedMarkdown content={message.content} />
            )}
          </div>
        ) : (
          <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        )}
        {message.isStreaming && message.content && (
          <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span className="text-sm">Mengetik...</span>
          </div>
        )}
      </ChatBubble>
    </div>
  )
}
