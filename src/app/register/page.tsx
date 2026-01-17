import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import RegisterPage from "@/blocks/register"

export const metadata: Metadata = {
  title: "Daftar - SIKAS",
  description: "Buat akun SIKAS baru untuk mulai mengelola keuangan Anda.",
}

export default async function Page() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <RegisterPage />
}
