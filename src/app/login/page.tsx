import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import LoginPage from "@/blocks/login"

export default async function Page() {
  // Redirect authenticated users to dashboard
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return <LoginPage />
}
