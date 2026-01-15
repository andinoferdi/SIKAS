import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth/session"
import { BottomNav, Sidebar, DashboardHeader } from "@/components/layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side auth check
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />

      <div className="lg:pl-72 transition-all duration-300">
        <DashboardHeader />
        <main className="max-w-7xl mx-auto pb-24 lg:pb-8">{children}</main>
      </div>

      <BottomNav />
    </div>
  )
}
