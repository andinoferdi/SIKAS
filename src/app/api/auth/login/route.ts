import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPin, verifyPin } from "@/lib/auth/pin"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const { userName, pin } = await request.json()

    if (!userName || !pin) {
      return NextResponse.json(
        { error: "Nama dan PIN harus diisi" },
        { status: 400 }
      )
    }

    if (pin.length < 4 || pin.length > 6) {
      return NextResponse.json(
        { error: "PIN harus 4-6 digit" },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, pin_hash")
      .eq("name", userName)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      )
    }

    if (!user.pin_hash) {
      const hashedPin = await hashPin(pin)
      await supabase
        .from("users")
        .update({ pin_hash: hashedPin })
        .eq("id", user.id)
    } else {
      const isValid = await verifyPin(pin, user.pin_hash)
      if (!isValid) {
        return NextResponse.json(
          { error: "PIN salah" },
          { status: 401 }
        )
      }
    }

    await createSession(user.id, user.name)

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name }
    })
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}
