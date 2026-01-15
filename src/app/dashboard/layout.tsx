import { BottomNav } from "@/components/layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="max-w-md mx-auto pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
