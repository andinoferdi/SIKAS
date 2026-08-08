"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Receipt, PlusCircle } from "lucide-react"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: Home,
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: Receipt,
  },
  {
    href: "/dashboard/transactions/add",
    label: "Tambah Transaksi",
    icon: PlusCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
      <div className="flex flex-col h-full">
        <div className="p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative flex items-center justify-center rounded-xl bg-primary/10 shrink-0">
              <Image
                src="/images/logo.png"
                alt="SIKAS"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SIKAS</h1>
              <p className="text-sm text-muted-foreground">Keuangan Bersama</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary-solid"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary-solid" : "text-muted-foreground"
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground text-center">SIKAS v1.0</p>
        </div>
      </div>
    </aside>
  )
}
