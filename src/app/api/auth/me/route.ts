import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      { error: "Tidak ada session" },
      { status: 401 }
    )
  }

  const supabase = await createClient()
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, mbanking_balance, cash_balance")
    .eq("id", session.userId)
    .single()

  if (error || !user) {
    return NextResponse.json(
      { error: "User tidak ditemukan" },
      { status: 404 }
    )
  }

  return NextResponse.json({ user })
}
