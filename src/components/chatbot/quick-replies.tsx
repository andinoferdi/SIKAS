"use client"

import { type QuickReply } from "@/types/chatbot"

interface QuickRepliesProps {
  replies: QuickReply[]
  onSelect: (message: string) => void
  disabled?: boolean
}

/*
  Versi lama memakai warna hardcode sky-600, sky-50, dan sky-200 sehingga
  komponen ini tidak pernah ikut berubah saat token warna diperbarui.
  Sekarang seluruhnya memakai token.
*/
export function QuickReplies({ replies, onSelect, disabled }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {replies.map((reply) => (
        <button
          key={reply.id}
          type="button"
          onClick={() => onSelect(reply.message)}
          disabled={disabled}
          className="rounded-lg border border-border px-3 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          {reply.text}
        </button>
      ))}
    </div>
  )
}
