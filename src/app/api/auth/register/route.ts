import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPin } from "@/lib/auth/pin"
import { createSession } from "@/lib/auth/session"
import { registerSchema } from "@/lib/validations"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = registerSchema.omit({ confirmPin: true }).safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      )
    }

    const { name, pin } = validation.data
    const trimmedName = name.trim()

    const supabase = await createClient()

    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("name", trimmedName)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: "Nama sudah terdaftar. Silakan gunakan nama lain atau login." },
        { status: 409 }
      )
    }

    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Terjadi kesalahan saat memeriksa data" },
        { status: 500 }
      )
    }

    const hashedPin = await hashPin(pin)

    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({
        name: trimmedName,
        pin_hash: hashedPin,
        mbanking_balance: 0,
        cash_balance: 0,
      })
      .select("id, name")
      .single()

    if (insertError || !newUser) {
      console.error("Insert error:", insertError)
      return NextResponse.json(
        { error: "Gagal membuat akun. Silakan coba lagi." },
        { status: 500 }
      )
    }

    await createSession(newUser.id, newUser.name)

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name }
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
