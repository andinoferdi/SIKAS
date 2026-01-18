import { createClient } from "@/lib/supabase/client"
import type { SearchResult } from "@/types/rag"

let embedder: unknown = null
let isInitializing = false
let initPromise: Promise<void> | null = null


async function initEmbedder(): Promise<void> {
  if (embedder) return

  if (isInitializing && initPromise) {
    await initPromise
    return
  }

  isInitializing = true
  initPromise = (async () => {
    try {
      const { pipeline } = await import("@xenova/transformers")
      embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
        quantized: true,
      })
    } catch (error) {
      console.error("Failed to initialize embedder:", error)
      throw new Error("Gagal memuat model embedding")
    } finally {
      isInitializing = false
    }
  })()

  await initPromise
}

/**
 * @param text 
 * @returns
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  await initEmbedder()

  if (!embedder) {
    throw new Error("Embedder not initialized")
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await (embedder as any)(text, {
    pooling: "mean",
    normalize: true,
  })

  return Array.from(output.data as Float32Array)
}


export async function storeKnowledge(
  content: string,
  category: string,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const embedding = await generateEmbedding(content)
    const supabase = createClient()

    const { error } = await supabase.from("knowledge_base_embeddings").insert({
      content,
      category,
      metadata: metadata || {},
      embedding,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return { success: false, error: message }
  }
}


export async function searchKnowledge(
  query: string,
  threshold: number = 0.5,
  limit: number = 5
): Promise<SearchResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(query)
    const supabase = createClient()

    const { data, error } = await supabase.rpc("match_knowledge_base", {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error("Knowledge search error:", error)
      return []
    }

    return (data || []) as SearchResult[]
  } catch (error) {
    console.error("Knowledge search failed:", error)
    return []
  }
}


export function isEmbedderReady(): boolean {
  return embedder !== null
}


export async function warmupEmbedder(): Promise<void> {
  await initEmbedder()
}

export const embeddingsService = {
  generateEmbedding,
  storeKnowledge,
  searchKnowledge,
  isEmbedderReady,
  warmupEmbedder,
}
