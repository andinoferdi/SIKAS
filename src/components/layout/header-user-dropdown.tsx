"use client"

import { useRef, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Loader2, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { userService } from "@/services"
import { cn } from "@/lib/utils"

interface HeaderUserDropdownProps {
  userName: string | undefined
}

export function HeaderUserDropdown({ userName }: HeaderUserDropdownProps) {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await userService.logout()
      toast.success("Berhasil logout")
      router.push("/login")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal logout")
      setLogoutLoading(false)
    }
  }

  const displayName = userName || "User"
  const initial = displayName[0]?.toUpperCase() || "U"

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex min-h-11 items-center gap-2 rounded-xl p-1.5 pr-3 transition-colors hover:bg-muted"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-solid text-sm font-medium text-primary-foreground">
          {initial}
        </div>
        <span className="hidden sm:block text-sm font-medium text-foreground max-w-24 truncate">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "hidden sm:block h-4 w-4 text-muted-foreground transition-transform",
            dropdownOpen && "rotate-180"
          )}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-1 z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Akun Personal</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => {
                handleLogout()
                setDropdownOpen(false)
              }}
              disabled={logoutLoading}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-destructive/10 transition-colors disabled:opacity-50"
            >
              {logoutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              {logoutLoading ? "Logging out..." : "Keluar"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
