import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPin } from "@/lib/auth/pin"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const { name, pin } = await request.json()

    // Validate name
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nama harus diisi" },
        { status: 400 }
      )
    }

    const trimmedName = name.trim()

    if (trimmedName.length < 2) {
      return NextResponse.json(
        { error: "Nama minimal 2 karakter" },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      return NextResponse.json(
        { error: "Nama hanya boleh huruf dan spasi" },
        { status: 400 }
      )
    }

    // Validate PIN
    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { error: "PIN harus diisi" },
        { status: 400 }
      )
    }

    if (pin.length < 4 || pin.length > 6) {
      return NextResponse.json(
        { error: "PIN harus 4-6 digit" },
        { status: 400 }
      )
    }

    if (!/^\d+$/.test(pin)) {
      return NextResponse.json(
        { error: "PIN harus berupa angka" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if user already exists
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

    // Only throw error if it's not "no rows returned"
    if (checkError && checkError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Terjadi kesalahan saat memeriksa data" },
        { status: 500 }
      )
    }

    // Hash PIN
    const hashedPin = await hashPin(pin)

    // Create new user
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

    // Create session
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
