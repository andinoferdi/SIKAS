"use client"

import { useRef, useEffect, memo } from "react"
import { Check, XCircle } from "lucide-react"
import { type Message, type QuickReply } from "@/types/chatbot"
import { ChatMessage } from "@/components/chatbot/chat-message"
import { QuickReplies } from "@/components/chatbot/quick-replies"
import { BatchActionConfirmation, type PendingAction } from "@/components/chatbot/batch-action-confirmation"
import { isBatchAction } from "@/components/chatbot/utils/action-parser"

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
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      {showQuickReplies && messages.length === 1 && (
        <div className="pt-2">
          <p className="text-xs text-muted-foreground mb-2 px-1">
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
          <div className="bg-muted/50 rounded-lg p-3 mx-1">
            <p className="text-sm text-foreground mb-3">{pendingAction.description}</p>
            <div className="flex gap-2">
              <button
                onClick={onConfirmAction}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {isLoading ? "Memproses..." : "Ya, Lanjutkan"}
              </button>
              <button
                onClick={onCancelAction}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive text-sm rounded-md hover:bg-destructive/20 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                Batal
              </button>
            </div>
          </div>
        )
      )}

      <div ref={messagesEndRef} />
    </div>
  )
})
