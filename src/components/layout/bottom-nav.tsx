"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, List, Plus } from "lucide-react"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: Home,
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: List,
  },
  {
    href: "/dashboard/add",
    label: "Tambah",
    icon: Plus,
    isMain: true,
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-20 gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center w-16 h-16 -mt-8 rounded-full bg-linear-to-br from-sky-500 to-sky-600 text-white shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-sky-700 transition-all duration-200 active:scale-95"
              >
                <Icon className="h-6 w-6" />
              </Link>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 py-2.5 px-4 rounded-lg transition-all duration-200",
                isActive ? "text-sky-600 font-medium bg-sky-50" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
