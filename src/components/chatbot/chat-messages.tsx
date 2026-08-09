"use client"

import { useRef, useEffect, memo } from "react"
import { Check, XCircle } from "lucide-react"
import { type Message, type QuickReply } from "@/types/chatbot"
import { ChatMessage } from "@/components/chatbot/chat-message"
import { QuickReplies } from "@/components/chatbot/quick-replies"
import { BatchActionConfirmation, type PendingAction } from "@/components/chatbot/batch-action-confirmation"
import { isBatchAction } from "@/components/chatbot/utils/action-parser"
import { useLenisPanel } from "@/components/scroll"

interface ChatMessagesProps {
  messages: Message[]
  showQuickReplies: boolean
  quickReplies: QuickReply[]
  onQuickReplySelect: (message: string) => void
  pendingAction: PendingAction | null
  onConfirmAction: () => void
  onCancelAction: () => void
  isLoading: boolean
  quickRepliesLabel: string
}

export const ChatMessages = memo(function ChatMessages({
  messages,
  showQuickReplies,
  quickReplies,
  onQuickReplySelect,
  pendingAction,
  onConfirmAction,
  onCancelAction,
  isLoading,
  quickRepliesLabel,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLenisPanel(containerRef)

  /*
    Menempel ke pesan terbaru dengan lompatan instan pada container, bukan
    scrollIntoView beranimasi. Animasi smooth milik browser berjalan lintas
    frame dan berebut dengan Lenis yang menulis scrollTop tiap frame, sedangkan
    lompatan instan diserap Lenis lalu disinkronkan.
  */
  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTo({ top: el.scrollHeight })
  }, [messages])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {showQuickReplies && messages.length === 1 && (
        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-2 px-1">
            {quickRepliesLabel}
          </p>
          <QuickReplies
            replies={quickReplies}
            onSelect={onQuickReplySelect}
            disabled={isLoading}
          />
        </div>
      )}

      {pendingAction && (
        isBatchAction(pendingAction.action) ? (
          <BatchActionConfirmation
            actions={[pendingAction]}
            onConfirm={onConfirmAction}
            onCancel={onCancelAction}
            isLoading={isLoading}
          />
        ) : (
          <div className="rounded-lg border border-border p-4">
            <p className="text-base leading-relaxed text-foreground">
              {pendingAction.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onConfirmAction}
                disabled={isLoading}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-btn-primary-hover disabled:opacity-50"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                {isLoading ? "Memproses" : "Ya, lanjutkan"}
              </button>
              <button
                type="button"
                onClick={onCancelAction}
                disabled={isLoading}
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:border-danger hover:text-danger disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" aria-hidden="true" />
                Batal
              </button>
            </div>
          </div>
        )
      )}

    </div>
  )
})
