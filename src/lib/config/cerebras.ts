import "server-only"

import type { Message } from "@/types/chatbot"
import { createAIModel, createModelCatalog, selectAutomaticModel } from "@/services/chatbot/core"

const CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1"

const parseCsv = (value: string | undefined): string[] => {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

const dedupe = (values: string[]): string[] => {
  return [...new Set(values)]
}

export const getCerebrasApiKey = (): string => {
  const apiKey = process.env.CEREBRAS_API_KEY

  if (!apiKey) {
    throw new Error("CEREBRAS_API_KEY belum dikonfigurasi.")
  }

  return apiKey
}

export const getCerebrasBaseUrl = (): string => CEREBRAS_BASE_URL

export const getChatModelIds = (): string[] => {
  const primaryModel = process.env.CEREBRAS_MODEL?.trim()

  if (!primaryModel) {
    throw new Error("CEREBRAS_MODEL belum dikonfigurasi.")
  }

  return dedupe([primaryModel, ...parseCsv(process.env.CEREBRAS_MODEL_FALLBACKS)])
}

export const getChatModels = () => {
  return createModelCatalog(getChatModelIds())
}

export const resolveRequestedModelId = (
  messages: Message[],
  modelIndex?: number,
  preferredModelId?: string
): string => {
  const modelIds = getChatModelIds()

  if (preferredModelId && modelIds.includes(preferredModelId)) {
    return preferredModelId
  }

  if (
    typeof modelIndex === "number" &&
    Number.isInteger(modelIndex) &&
    modelIndex > 0 &&
    modelIds[modelIndex]
  ) {
    return modelIds[modelIndex]
  }

  return selectAutomaticModel(messages, modelIds)
}

export const createModelAttemptOrder = (startModelId: string): string[] => {
  const modelIds = getChatModelIds()
  const startIndex = Math.max(modelIds.indexOf(startModelId), 0)

  return [...modelIds.slice(startIndex), ...modelIds.slice(0, startIndex)]
}

export const getPrimaryModel = () => {
  return createAIModel(getChatModelIds()[0])
}
