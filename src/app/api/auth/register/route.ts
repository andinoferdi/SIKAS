import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { hashPin } from "@/lib/auth/pin"
import { createSession } from "@/lib/auth/session"
import { z } from "zod"
import { jsonResponse, errorResponse } from "@/lib/utils/api-response"

const registerApiSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter").regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh huruf dan spasi"),
  pin: z.string().min(4, "PIN minimal 4 digit").max(6, "PIN maksimal 6 digit").regex(/^\d+$/, "PIN hanya boleh angka"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = registerApiSchema.safeParse(body)

    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return errorResponse(firstError.message, 400)
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
      return errorResponse("Nama sudah terdaftar. Silakan gunakan nama lain atau login.", 409)
    }

    if (checkError && checkError.code !== "PGRST116") {
      return errorResponse("Terjadi kesalahan saat memeriksa data", 500)
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
      return errorResponse("Gagal membuat akun. Silakan coba lagi.", 500)
    }

    await createSession(newUser.id, newUser.name)

    return jsonResponse({
      success: true,
      user: { id: newUser.id, name: newUser.name }
    })
  } catch (error) {
    console.error("Register error:", error)
    return errorResponse("Terjadi kesalahan server", 500)
  }
}
