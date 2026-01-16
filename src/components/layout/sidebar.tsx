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
    href: "/dashboard/add",
    label: "Tambah Transaksi",
    icon: PlusCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-neutral-200">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="p-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative flex items-center justify-center rounded-xl bg-sky-500 shrink-0">
              <Image
                src="/images/logo.png"
                alt="SIKAS"
                width={28}
                height={28}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-neutral-900">SIKAS</h1>
              <p className="text-xs text-neutral-500">Keuangan Bersama</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sky-50 text-sky-700"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-sky-600" : "text-neutral-400"
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 text-center">SIKAS v1.0</p>
        </div>
      </div>
    </aside>
  )
}
