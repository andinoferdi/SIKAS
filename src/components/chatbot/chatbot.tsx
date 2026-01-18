"use client"

import { useState } from "react"
import { ChatbotButton } from "@/components/chatbot/chatbot-button"
import { ChatbotPanel } from "@/components/chatbot/chatbot-panel"

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleChat = () => {
    setIsOpen((prev) => !prev)
  }

  return (
    <>
      <ChatbotPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <ChatbotButton isOpen={isOpen} onClick={toggleChat} />
    </>
  )
}
