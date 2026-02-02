import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPin, verifyPin } from "@/lib/auth/pin"
import { createSession } from "@/lib/auth/session"
import { loginSchema } from "@/lib/validations"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = loginSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return errorResponse(firstError.message, 400)
    }

    const { name: userName, pin } = validation.data

    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, pin_hash")
      .eq("name", userName)
      .single()

    if (error || !user) {
      return errorResponse("User tidak ditemukan", 404)
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
        return errorResponse("PIN salah", 401)
      }
    }

    await createSession(user.id, user.name)

    return jsonResponse({
      success: true,
      user: { id: user.id, name: user.name }
    })
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
