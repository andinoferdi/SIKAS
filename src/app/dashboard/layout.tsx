import { BottomNav, Sidebar } from "@/components/layout"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background-secondary">
      <Sidebar />

      <div className="lg:pl-64">
        <main className="max-w-7xl mx-auto pb-24 lg:pb-8 lg:px-8">
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
