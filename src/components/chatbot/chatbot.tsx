"use client"

import { useState } from "react"
import { ChatbotButton } from "./chatbot-button"
import { ChatbotPanel } from "./chatbot-panel"

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
