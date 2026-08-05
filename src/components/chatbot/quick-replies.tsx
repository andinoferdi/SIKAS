"use client"

import { type QuickReply } from "@/types/chatbot"

interface QuickRepliesProps {
  replies: QuickReply[]
  onSelect: (message: string) => void
  disabled?: boolean
}

export function QuickReplies({ replies, onSelect, disabled }: QuickRepliesProps) {
  return (
    <div className="flex flex-wrap gap-2 px-1">
      {replies.map((reply) => (
        <button
          key={reply.id}
          onClick={() => onSelect(reply.message)}
          disabled={disabled}
          className="px-3 py-1.5 text-sm font-medium text-sky-600 bg-sky-50 border border-sky-200 rounded-full hover:bg-sky-100 hover:border-sky-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {reply.text}
        </button>
      ))}
    </div>
  )
}
