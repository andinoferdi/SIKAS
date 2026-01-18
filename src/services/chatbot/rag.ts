import type { RAGContext, EnhancedRAGContext } from "@/types/rag"

/**
 * Retrieve relevant context from knowledge base via API
 * This calls the server-side API to generate embeddings and search
 * @param query
 * @param threshold
 * @param limit
 * @param includeUserContext 
 */
export async function retrieveContext(
  query: string,
  threshold: number = 0.4,
  limit: number = 3,
  includeUserContext: boolean = false
): Promise<EnhancedRAGContext> {
  try {
    const response = await fetch("/api/chatbot/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, threshold, limit, includeUserContext }),
    })

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Search failed")
    }

    return data.context as EnhancedRAGContext
  } catch (error) {
    console.error("RAG retrieval failed:", error)
    return {
      query,
      relevantDocs: [],
      avgSimilarity: 0,
    }
  }
}

export function isContextUseful(context: RAGContext): boolean {
  return context.relevantDocs.length > 0 && context.avgSimilarity > 0.5
}


export function formatContextDebug(context: RAGContext): string {
  if (context.relevantDocs.length === 0) {
    return `Query: "${context.query}" - No relevant documents found`
  }

  const docs = context.relevantDocs
    .map(
      (doc, i) =>
        `  ${i + 1}. [${doc.category}] (${(doc.similarity * 100).toFixed(1)}%): ${doc.content.substring(0, 50)}...`
    )
    .join("\n")

  return `Query: "${context.query}"\nAvg Similarity: ${(context.avgSimilarity * 100).toFixed(1)}%\nDocuments:\n${docs}`
}

export const ragService = {
  retrieveContext,
  isContextUseful,
  formatContextDebug,
}
