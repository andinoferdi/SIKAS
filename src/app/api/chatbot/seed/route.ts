import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { knowledgeData, getKnowledgeCount } from "@/services/chatbot"

// This is a simple API to seed the knowledge base
// In production, you might want to add authentication

export async function POST() {
  try {
    const supabase = await createClient()

    // Check if knowledge base already has data
    const { count: existingCount } = await supabase
      .from("knowledge_base_embeddings")
      .select("*", { count: "exact", head: true })

    if (existingCount && existingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Knowledge base already has ${existingCount} entries. Clear it first if you want to re-seed.`,
        },
        { status: 400 }
      )
    }

    // Import embeddings dynamically to avoid SSR issues
    const { generateEmbedding } = await import("@/services/chatbot/embeddings")

    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    }

    // Process entries sequentially to avoid overwhelming the embedder
    for (const entry of knowledgeData) {
      try {
        // Generate embedding
        const embedding = await generateEmbedding(entry.content)

        // Store in Supabase
        const { error } = await supabase.from("knowledge_base_embeddings").insert({
          content: entry.content,
          category: entry.category,
          metadata: entry.metadata || {},
          embedding,
        })

        if (error) {
          results.failed++
          results.errors.push(`[${entry.category}] ${error.message}`)
        } else {
          results.success++
        }
      } catch (error) {
        results.failed++
        results.errors.push(
          `[${entry.category}] ${error instanceof Error ? error.message : "Unknown error"}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.success}/${getKnowledgeCount()} entries`,
      details: results,
    })
  } catch (error) {
    console.error("Seed error:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check status
export async function GET() {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from("knowledge_base_embeddings")
      .select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      totalEntries: count || 0,
      expectedEntries: getKnowledgeCount(),
      isSeeded: (count || 0) >= getKnowledgeCount(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE endpoint to clear knowledge base
export async function DELETE() {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("knowledge_base_embeddings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Knowledge base cleared",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
