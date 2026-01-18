import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { getUserContext, formatUserContextForPrompt } from "@/services/chatbot/user-context"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userContext = await getUserContext(session.userId)
    const formattedContext = formatUserContextForPrompt(userContext)

    return NextResponse.json({
      context: userContext,
      formatted: formattedContext,
    })
  } catch (error) {
    console.error("Error fetching user context:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
