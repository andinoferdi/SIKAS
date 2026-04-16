"use client"

import { useQuery } from "@tanstack/react-query"
import type { AIModel } from "@/types/chatbot"

interface ChatModelsResponse {
  models: AIModel[]
}

const fetchChatModels = async (): Promise<AIModel[]> => {
  const response = await fetch("/api/chatbot/models", {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error("Gagal memuat model chatbot.")
  }

  const data = (await response.json()) as ChatModelsResponse
  return data.models || []
}

export function useChatModels() {
  return useQuery({
    queryKey: ["chatbot", "models"],
    queryFn: fetchChatModels,
    staleTime: 5 * 60 * 1000,
  })
}
