"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Search, User, LogOut, TrendingUp, TrendingDown, Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { userService, transactionService } from "@/service"
import { useRouter } from "next/navigation"
import type { Transaction } from "@/types"
import { formatCurrency, formatShortDate } from "@/lib/utils/format"

const MIN_SCROLL = 10

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > MIN_SCROLL)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await userService.getCurrentUser()
      if (userData) setUser(userData)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchValue.trim().length >= 2) {
        setSearchLoading(true)
        const results = await transactionService.searchTransactions(searchValue)
        setSearchResults(results)
        setShowSearchResults(true)
        setSearchLoading(false)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchValue])

  const getPageTitle = (path: string) => {
    if (path === "/dashboard") return "Beranda"
    if (path === "/dashboard/transactions") return "Riwayat Transaksi"
    if (path === "/dashboard/add") return "Tambah Transaksi"
    if (path.startsWith("/dashboard/profile")) return "Profil Saya"
    return "Dashboard"
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    const success = await userService.logout()
    if (success) {
      toast.success("Berhasil logout")
      router.push("/login")
    } else {
      toast.error("Gagal logout")
      setLogoutLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchValue("")
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleResultClick = () => {
    setShowSearchResults(false)
    setSearchValue("")
    router.push("/dashboard/transactions")
  }

  return (
    <header
      className={`sticky top-0 z-40 bg-background border-b border-border transition-all duration-200 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
    >
      <div className="flex h-20 items-center justify-between px-4 lg:px-8 max-w-full">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <h1 className="text-lg lg:text-xl font-semibold text-foreground hidden lg:block truncate">
            {getPageTitle(pathname)}
          </h1>
          <span className="lg:hidden text-base font-bold text-primary">SIKAS</span>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 ml-auto">
          <div ref={searchRef} className="hidden md:flex relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari transaksi..."
              value={searchValue}
              onChange={handleSearchChange}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              className="pl-9 pr-8 h-9 bg-muted border-border focus:bg-background focus:border-primary transition-all rounded-full text-sm"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
            )}
            {!searchLoading && searchValue && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover rounded-lg shadow-lg border border-border overflow-hidden z-50">
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((transaction) => (
                      <button
                        key={transaction.id}
                        onClick={handleResultClick}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            transaction.type === "income"
                              ? "bg-success-bg text-success"
                              : "bg-danger-bg text-danger"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {transaction.category}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {formatShortDate(transaction.transaction_date)}
                            {transaction.description && ` · ${transaction.description}`}
                          </p>
                        </div>
                        <p
                          className={`text-sm font-medium shrink-0 ${
                            transaction.type === "income" ? "text-success" : "text-danger"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Tidak ada hasil untuk &ldquo;{searchValue}&rdquo;
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 lg:gap-3 pl-1 pr-2 lg:pr-3 py-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer group"
            >
              <div className="h-8 w-8 lg:h-9 lg:w-9 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                {user?.name?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight group-hover:text-sky-600 transition-colors">
                  {user?.name || "User"}
                </p>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg border border-border py-2 z-50">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
                </div>

                <button
                  onClick={() => {
                    handleLogout()
                    setDropdownOpen(false)
                  }}
                  disabled={logoutLoading}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-bg transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  {logoutLoading ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
