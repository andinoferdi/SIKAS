import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import {
  createModelAttemptOrder,
  getOpenRouterBaseUrl,
  getOpenRouterHeaders,
  resolveRequestedModelId,
} from "@/lib/config/openrouter"
import { errorResponse } from "@/lib/utils/api-response"
import { formatShortDate, getJakartaDateString } from "@/lib/utils/format"
import { createSystemPrompt } from "@/services/chatbot"
import {
  extractCreateTransactionPayload,
  extractEditTransactionUpdates,
  extractSetBalanceTarget,
  isLikelyBalanceQuery,
  isLikelyDeleteLatestIntent,
  isLikelyEditLatestIntent,
  isLikelyLatestTransactionQuery,
} from "@/services/chatbot/intent-parser"
import {
  formatAmount,
  formatBalanceSentence,
  formatDraftTransactionSummary,
  formatTransactionSummary,
  getPaymentMethodLabel,
  getTransactionTypeLabel,
} from "@/services/chatbot/presentation"
import {
  formatUserContextForPrompt,
  getUserContext,
  searchUserTransactions,
} from "@/services/chatbot/user-context"
import {
  estimateMessagesTokens,
  pruneConversationHistory,
} from "@/services/chatbot/token-utils"
import type { Message, StreamChunk } from "@/types/chatbot"
import type {
  CreateTransactionPayload,
  DeleteTransactionPayload,
  EditTransactionPayload,
  EnhancedRAGContext,
  SearchTransactionsPayload,
  UserChatContext,
} from "@/types/rag"
import type { Transaction } from "@/types/transaction"

interface ChatRequestBody {
  messages?: Message[]
  modelIndex?: number
  preferredModelId?: string
  ragContext?: EnhancedRAGContext
}

const MIN_MBANKING_BALANCE = 50_000
const RETRYABLE_STATUS_CODES = new Set([404, 408, 409, 425, 429, 500, 502, 503, 504])
const textEncoder = new TextEncoder()

const isRetryableStatus = (status: number) => {
  return RETRYABLE_STATUS_CODES.has(status) || status >= 500
}

const buildApiMessages = (messages: Message[], ragContext?: EnhancedRAGContext) => {
  const systemPrompt = createSystemPrompt(ragContext)
  const prunedMessages = pruneConversationHistory(
    messages.filter((message) => message.role !== "system")
  )

  return [systemPrompt, ...prunedMessages].map((message) => ({
    role: message.role,
    content: message.content,
  }))
}

const createSseResponse = (content: string, modelId = "deterministic-finance") => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunk: StreamChunk = {
        choices: [{ delta: { content } }],
      }

      controller.enqueue(textEncoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      controller.enqueue(textEncoder.encode("data: [DONE]\n\n"))
      controller.close()
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Connection: "keep-alive",
      "X-Model-Used": modelId,
    },
  })
}

const getLastUserMessage = (messages: Message[]) => {
  return (
    messages
      .slice()
      .reverse()
      .find((message) => message.role === "user")
      ?.content.trim() || ""
  )
}

const getPreviousUserMessage = (messages: Message[]) => {
  const userMessages = messages.filter((message) => message.role === "user")
  return userMessages.at(-2)?.content.trim() || ""
}

const getLastAssistantMessage = (messages: Message[]) => {
  const assistantMessages = messages.filter((message) => message.role === "assistant")
  return assistantMessages.at(-1)?.content.trim() || ""
}

const getLatestTransaction = (userContext?: UserChatContext): Transaction | null => {
  if (!userContext?.recentTransactions.length) {
    return null
  }

  return userContext.recentTransactions[0]
}

const SEARCH_INTENT_PATTERN = /\b(cari|temukan|tampilkan)\s+transaksi\s+(.+)/i

interface SearchIntentResult {
  rawTerm: string
  filters: SearchTransactionsPayload
}

const extractSearchFilters = (message: string): SearchIntentResult | null => {
  const match = message.match(SEARCH_INTENT_PATTERN)
  if (!match) {
    return null
  }

  if (isLikelyLatestTransactionQuery(message)) {
    return null
  }

  const rawTerm = match[2]?.trim()
  if (!rawTerm) {
    return null
  }

  const normalizedTerm = rawTerm
    .replace(/\b(saya|saya punya|dong|ya)\b/gi, "")
    .trim()

  if (!normalizedTerm) {
    return null
  }

  const categoryMap: Array<{ keyword: RegExp; category: string }> = [
    { keyword: /\bgaji\b/i, category: "Gaji" },
    { keyword: /\bbonus\b/i, category: "Bonus" },
    { keyword: /\btransfer masuk\b/i, category: "Transfer Masuk" },
    { keyword: /\bmakan|makanan\b/i, category: "Makan" },
    { keyword: /\btransport|bensin|ojek|taksi|taxi|grab|gojek|bus|kereta\b/i, category: "Transport" },
    { keyword: /\bbelanja|shopping\b/i, category: "Belanja" },
    { keyword: /\btagihan|listrik|air|internet|telepon|pulsa\b/i, category: "Tagihan" },
  ]

  const category = categoryMap.find(({ keyword }) => keyword.test(normalizedTerm))?.category
  const type: SearchTransactionsPayload["type"] =
    /\bpemasukan|income\b/i.test(normalizedTerm)
      ? "income"
      : /\bpengeluaran|expense\b/i.test(normalizedTerm)
        ? "expense"
        : undefined

  const filters: SearchTransactionsPayload = {
    ...(category && { category }),
    ...(type && { type }),
    ...(!category && { description: normalizedTerm }),
  }

  return {
    rawTerm: normalizedTerm,
    filters,
  }
}

const buildLoginRequiredMessage = () => {
  return "Untuk cek saldo atau mengelola transaksi pribadimu, kamu perlu login dulu ke akun SIKAS. Setelah masuk, saya bisa bantu cek saldo, catat transaksi, edit, dan hapus transaksi lewat chat."
}

const buildBalanceReply = (userContext: UserChatContext) => {
  return [
    "Saldo kamu saat ini:",
    `- ${formatBalanceSentence("M-Banking", userContext.balances.mbanking).replace(" kamu saat ini ", ": ")}`,
    `- ${formatBalanceSentence("Cash", userContext.balances.cash).replace(" kamu saat ini ", ": ")}`,
  ].join("\n")
}

const summarizeEditChanges = (updates: EditTransactionPayload["updates"]) => {
  const changes: string[] = []

  if (updates.amount !== undefined) {
    changes.push(`jumlah ${formatAmount(updates.amount)}`)
  }

  if (updates.type !== undefined) {
    changes.push(`jenis ${getTransactionTypeLabel(updates.type)}`)
  }

  if (updates.category !== undefined) {
    changes.push(`kategori ${updates.category}`)
  }

  if (updates.payment_method !== undefined) {
    changes.push(`metode ${getPaymentMethodLabel(updates.payment_method)}`)
  }

  if (updates.description !== undefined) {
    changes.push(
      updates.description ? `deskripsi "${updates.description}"` : "deskripsi dikosongkan"
    )
  }

  if (updates.transaction_date !== undefined) {
    changes.push(`tanggal ${formatShortDate(updates.transaction_date)}`)
  }

  return changes.join(", ")
}

const validateCreateTransaction = (
  userContext: UserChatContext,
  payload: CreateTransactionPayload
) => {
  if (payload.type !== "expense") {
    return null
  }

  const isMbanking = payload.payment_method === "mbanking"
  const currentBalance = isMbanking
    ? userContext.balances.mbanking
    : userContext.balances.cash

  if (payload.amount > currentBalance) {
    return `Saldo ${isMbanking ? "M-Banking" : "Cash"} kamu saat ini ${formatAmount(currentBalance)}, jadi belum cukup untuk mencatat pengeluaran ${formatAmount(payload.amount)}.`
  }

  if (isMbanking && currentBalance - payload.amount < MIN_MBANKING_BALANCE) {
    return `Saldo M-Banking kamu saat ini ${formatAmount(currentBalance)}. Pengeluaran ini akan membuat saldo di bawah batas minimum ${formatAmount(MIN_MBANKING_BALANCE)}.`
  }

  return null
}

const buildSearchReply = (transactions: Transaction[], rawTerm: string) => {
  if (transactions.length === 0) {
    return `Tidak ada transaksi yang cocok untuk kata kunci "${rawTerm}".`
  }

  const lines = transactions
    .slice(0, 5)
    .map((transaction) => `- ${formatTransactionSummary(transaction)}`)

  return [`Berikut transaksi yang ditemukan untuk "${rawTerm}":`, ...lines].join("\n")
}

const ensureUserContext = async (
  ragContext: EnhancedRAGContext | undefined,
  sessionUserId: string | undefined
) => {
  let userContext = ragContext?.userContext
  let formattedUserContext = ragContext?.formattedUserContext

  if (!userContext && sessionUserId) {
    try {
      userContext = await getUserContext(sessionUserId)
      formattedUserContext = formatUserContextForPrompt(userContext)
    } catch (error) {
      console.error("Failed to resolve user context inside chat route:", error)
    }
  }

  const effectiveRagContext: EnhancedRAGContext | undefined =
    userContext || ragContext
      ? {
          query: ragContext?.query || "",
          relevantDocs: ragContext?.relevantDocs || [],
          avgSimilarity: ragContext?.avgSimilarity || 0,
          ...(userContext && { userContext }),
          ...(formattedUserContext && { formattedUserContext }),
        }
      : undefined

  return {
    userContext,
    effectiveRagContext,
  }
}

const maybeHandleDeterministicIntent = async (
  messages: Message[],
  message: string,
  sessionUserId: string | undefined,
  userContext?: UserChatContext
) => {
  const latestTransaction = getLatestTransaction(userContext)
  const previousUserMessage = getPreviousUserMessage(messages)
  const lastAssistantMessage = getLastAssistantMessage(messages)
  const editUpdates = extractEditTransactionUpdates(message)
  const searchIntent = extractSearchFilters(message)
  const isLatestEditFollowUp =
    Object.keys(editUpdates).length > 0 &&
    isLikelyEditLatestIntent(previousUserMessage) &&
    lastAssistantMessage.includes("Bagian mana yang mau diubah?")

  const balanceTarget = extractSetBalanceTarget(message)
  if (balanceTarget) {
    if (!sessionUserId || !userContext) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    const methodLabel = getPaymentMethodLabel(balanceTarget.paymentMethod)
    const current =
      balanceTarget.paymentMethod === "mbanking"
        ? userContext.balances.mbanking
        : userContext.balances.cash
    const difference = balanceTarget.target - current

    if (difference === 0) {
      return createSseResponse(
        `Saldo ${methodLabel} kamu sudah ${formatAmount(balanceTarget.target)}, jadi tidak perlu penyesuaian.`
      )
    }

    const payload: CreateTransactionPayload = {
      amount: Math.abs(difference),
      type: difference > 0 ? "income" : "expense",
      category: "Lainnya",
      payment_method: balanceTarget.paymentMethod,
      transaction_date: getJakartaDateString(),
      description: `Penyesuaian saldo ${methodLabel}`,
    }

    const arah = difference > 0 ? "menambah pemasukan" : "mencatat pengeluaran"
    return createSseResponse(
      `Saldo ${methodLabel} kamu saat ini ${formatAmount(current)}. Untuk mencapai ${formatAmount(
        balanceTarget.target
      )}, saya akan ${arah} ${formatAmount(Math.abs(difference))}. Mohon konfirmasi dulu ya.\n[PENDING_ACTION:create_transaction]${JSON.stringify(
        payload
      )}[/PENDING_ACTION]`
    )
  }

  if (isLikelyBalanceQuery(message)) {
    if (!sessionUserId || !userContext) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    return createSseResponse(buildBalanceReply(userContext))
  }

  if (isLikelyLatestTransactionQuery(message)) {
    if (!sessionUserId || !userContext) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    if (!latestTransaction) {
      return createSseResponse("Belum ada transaksi yang tercatat di akunmu.")
    }

    return createSseResponse(
      `Transaksi terakhir kamu adalah ${formatTransactionSummary(latestTransaction)}.`
    )
  }

  if (searchIntent) {
    if (!sessionUserId) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    const transactions = await searchUserTransactions(sessionUserId, searchIntent.filters)
    return createSseResponse(buildSearchReply(transactions, searchIntent.rawTerm))
  }

  if (isLikelyDeleteLatestIntent(message)) {
    if (!sessionUserId || !userContext) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    if (!latestTransaction) {
      return createSseResponse("Belum ada transaksi yang bisa dihapus.")
    }

    const transactionLabel = formatTransactionSummary(latestTransaction)
    const payload: DeleteTransactionPayload = {
      transactionId: latestTransaction.id,
      transactionLabel,
    }

    return createSseResponse(
      `Saya siap menghapus ${transactionLabel}. Mohon konfirmasi dulu ya.\n[PENDING_ACTION:delete_transaction]${JSON.stringify(payload)}[/PENDING_ACTION]`
    )
  }

  if (isLikelyEditLatestIntent(message) || isLatestEditFollowUp) {
    if (!sessionUserId || !userContext) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    if (!latestTransaction) {
      return createSseResponse("Belum ada transaksi yang bisa diubah.")
    }

    const transactionLabel = formatTransactionSummary(latestTransaction)
    const updates = editUpdates

    if (Object.keys(updates).length === 0) {
      return createSseResponse(
        `Transaksi terakhir kamu adalah ${transactionLabel}. Bagian mana yang mau diubah? Kamu bisa sebut jumlah, kategori, metode pembayaran, jenis, deskripsi, atau tanggal baru.`
      )
    }

    const changeSummary = summarizeEditChanges(updates)
    const payload: EditTransactionPayload = {
      transactionId: latestTransaction.id,
      transactionLabel,
      changeSummary,
      updates,
    }

    return createSseResponse(
      `Saya siap mengubah ${transactionLabel} menjadi ${changeSummary}. Mohon konfirmasi dulu ya.\n[PENDING_ACTION:edit_transaction]${JSON.stringify(payload)}[/PENDING_ACTION]`
    )
  }

  const createPayload = extractCreateTransactionPayload(message)
  if (createPayload) {
    if (!sessionUserId || !userContext) {
      return createSseResponse(buildLoginRequiredMessage())
    }

    const validationError = validateCreateTransaction(userContext, createPayload)
    if (validationError) {
      return createSseResponse(validationError)
    }

    const transactionLabel = formatDraftTransactionSummary(createPayload)
    const payload: CreateTransactionPayload = {
      ...createPayload,
      transactionLabel,
    }

    return createSseResponse(
      `Saya siap mencatat ${transactionLabel}. Mohon konfirmasi dulu ya.\n[PENDING_ACTION:create_transaction]${JSON.stringify(payload)}[/PENDING_ACTION]`
    )
  }

  return null
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const messages = body.messages ?? []

    if (messages.length === 0) {
      return errorResponse("Pesan tidak boleh kosong.", 400)
    }

    const lastUserMessage = getLastUserMessage(messages)
    const session = await getSession()
    const { userContext, effectiveRagContext } = await ensureUserContext(
      body.ragContext,
      session?.userId
    )

    const deterministicResponse = await maybeHandleDeterministicIntent(
      messages,
      lastUserMessage,
      session?.userId,
      userContext
    )
    if (deterministicResponse) {
      return deterministicResponse
    }

    const selectedModelId = await resolveRequestedModelId(
      messages,
      body.modelIndex,
      body.preferredModelId
    )
    const attemptOrder = await createModelAttemptOrder(selectedModelId)
    const apiMessages = buildApiMessages(messages, effectiveRagContext)

    if (process.env.NODE_ENV === "development") {
      const estimatedTokens = estimateMessagesTokens(
        apiMessages.map((message) => ({
          ...message,
          id: "debug",
          timestamp: new Date(),
        }))
      )
      console.log(
        `[Chatbot] Attempt order: ${attemptOrder.join(" -> ")} | ~${estimatedTokens} tokens`
      )
    }

    let lastErrorMessage = "Semua model gratis sedang tidak tersedia. Coba lagi sebentar lagi."

    for (const modelId of attemptOrder) {
      const response = await fetch(`${getOpenRouterBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: getOpenRouterHeaders(),
        body: JSON.stringify({
          model: modelId,
          messages: apiMessages,
          stream: true,
          temperature: 0.7,
          /*
            Seluruh model gratis OpenRouter saat ini adalah model reasoning, dan
            token berpikirnya masuk ke delta.reasoning sambil tetap memotong
            jatah max_tokens. Prompt CRUD membawa instruksi aksi ~4KB sehingga
            model berpikir jauh lebih lama, jatah habis sebelum blok
            [PENDING_ACTION] sempat ditutup, dan balasan datang kosong atau
            terpotong. Reasoning dimatikan, jatah dinaikkan sebagai pengaman.
          */
          reasoning: { enabled: false },
          max_tokens: 2000,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        const shouldRetry = isRetryableStatus(response.status)

        console.warn("[Chatbot] Permintaan OpenRouter gagal", {
          modelId,
          status: response.status,
          shouldRetry,
        })

        lastErrorMessage =
          response.status === 401
            ? "Autentikasi OpenRouter gagal. Periksa OPENROUTER_API_KEY di server."
            : errorText || lastErrorMessage

        if (shouldRetry) {
          continue
        }

        return errorResponse(lastErrorMessage, response.status)
      }

      if (!response.body) {
        lastErrorMessage = `Model ${modelId} tidak mengirim stream respons.`
        continue
      }

      const reader = response.body.getReader()

      /*
        OpenRouter tetap membalas 200 meski model tidak menghasilkan satu pun
        token teks, misalnya saat seluruh jatah habis dipakai reasoning. Dulu
        stream kosong itu diteruskan apa adanya dan user hanya melihat pesan
        "tidak bisa memberikan respons" tanpa jejak apa pun di server. Chunk
        awal ditahan dulu sampai ada teks sungguhan; bila tidak ada, model
        berikutnya dicoba.
      */
      const prefix: Uint8Array[] = []
      const peekDecoder = new TextDecoder()
      let sawContent = false
      let pending = ""

      while (!sawContent) {
        const { done, value } = await reader.read()
        if (done) break

        prefix.push(value)
        pending += peekDecoder.decode(value, { stream: true })
        const lines = pending.split("\n")
        pending = lines.pop() || ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6)
          if (data === "[DONE]") continue

          try {
            const chunk = JSON.parse(data) as StreamChunk
            if (chunk.choices?.[0]?.delta?.content) {
              sawContent = true
              break
            }
          } catch {
            continue
          }
        }
      }

      if (!sawContent) {
        console.warn("[Chatbot] Model tidak menghasilkan teks jawaban", { modelId })
        lastErrorMessage = `Model ${modelId} tidak menghasilkan teks jawaban.`
        await reader.cancel().catch(() => undefined)
        continue
      }

      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          try {
            for (const chunk of prefix) {
              controller.enqueue(chunk)
            }

            while (true) {
              const { done, value } = await reader.read()

              if (done) break
              controller.enqueue(value)
            }
          } catch (error) {
            controller.error(error)
            return
          } finally {
            reader.releaseLock()
          }

          controller.close()
        },
      })

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Connection: "keep-alive",
          "X-Model-Used": modelId,
        },
      })
    }

    return errorResponse(lastErrorMessage, 503)
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Terjadi kesalahan server.",
      500
    )
  }
}
