"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Receipt, Plus } from "lucide-react"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: Home,
  },
  {
    href: "/dashboard/transactions/add",
    label: "Tambah",
    icon: Plus,
    isMain: true,
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: Receipt,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 pb-safe z-40">
      <div className="max-w-md mx-auto flex items-center justify-around h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-center w-14 h-14 -mt-7 rounded-2xl shadow-lg transition-all duration-200 active:scale-95",
                  isActive
                    ? "bg-primary/90 shadow-primary/30"
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
              >
                <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className={cn("text-sm font-medium", isActive && "text-primary")}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
