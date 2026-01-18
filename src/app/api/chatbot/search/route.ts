import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import type { EnhancedRAGContext } from "@/types/rag"

export async function POST(request: Request) {
  try {
    const { query, threshold = 0.4, limit = 3, includeUserContext = false } = await request.json()

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { success: false, message: "Query is required" },
        { status: 400 }
      )
    }

    // Import embeddings dynamically to avoid SSR issues
    const { searchKnowledge } = await import("@/services/chatbot/embeddings")

    const relevantDocs = await searchKnowledge(query.trim(), threshold, limit)

    const avgSimilarity =
      relevantDocs.length > 0
        ? relevantDocs.reduce((sum, doc) => sum + doc.similarity, 0) /
          relevantDocs.length
        : 0

    const ragContext: EnhancedRAGContext = {
      query: query.trim(),
      relevantDocs,
      avgSimilarity,
    }

    // Include user context if requested and user is authenticated
    if (includeUserContext) {
      const session = await getSession()
      if (session) {
        try {
          const { getUserContext, formatUserContextForPrompt } = await import(
            "@/services/chatbot/user-context"
          )
          const userContext = await getUserContext(session.userId)
          ragContext.userContext = userContext
          ragContext.formattedUserContext = formatUserContextForPrompt(userContext)
        } catch (error) {
          console.error("Failed to get user context:", error)
          // Continue without user context
        }
      }
    }

    return NextResponse.json({
      success: true,
      context: ragContext,
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
