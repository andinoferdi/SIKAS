import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import LoginPage from "@/blocks/login"

export default async function Page() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LoginPage />
}
