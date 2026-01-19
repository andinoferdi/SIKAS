import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { knowledgeData, getKnowledgeCount } from "@/services/chatbot"



export async function POST() {
  try {
    const supabase = await createClient()

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

    const { generateEmbedding } = await import("@/services/chatbot/embeddings")

    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    }

    for (const entry of knowledgeData) {
      try {
        const embedding = await generateEmbedding(entry.content)

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

export async function DELETE() {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("knowledge_base_embeddings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") 

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
