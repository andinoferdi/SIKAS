import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import LoginPage from "@/blocks/login"

export const metadata: Metadata = {
  title: "Masuk - SIKAS",
  description: "Masuk ke akun SIKAS Anda untuk mengelola keuangan pribadi.",
}

export default async function Page() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LoginPage />
}
