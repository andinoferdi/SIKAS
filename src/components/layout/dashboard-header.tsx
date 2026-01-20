"use client"

import type React from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Search, LogOut, TrendingUp, TrendingDown, Loader2, X, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState, useRef } from "react"
import { userService, transactionService } from "@/services"
import type { Transaction } from "@/types"
import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

const MIN_SCROLL = 10

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
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
    if (path === "/dashboard/transactions/add") return "Tambah Transaksi"
    return "Dashboard"
  }

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await userService.logout()
      toast.success("Berhasil logout")
      router.push("/login")
    } catch {
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
    setMobileSearchOpen(false)
    router.push("/dashboard/transactions")
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-card border-b transition-all duration-200",
          scrolled ? "border-border shadow-sm" : "border-transparent"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="SIKAS"
                  width={20}
                  height={20}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="text-lg font-bold text-primary">SIKAS</span>
            </div>
            <h1 className="hidden lg:block text-lg font-semibold text-foreground truncate">
              {getPageTitle(pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>

            <div ref={searchRef} className="hidden md:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  className="w-56 lg:w-64 h-10 pl-9 pr-9 bg-muted border-0 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
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
              </div>

              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((transaction) => (
                        <button
                          key={transaction.id}
                          onClick={handleResultClick}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0 cursor-pointer"
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                              transaction.type === "income"
                                ? "bg-success-bg text-success"
                                : "bg-danger-bg text-danger"
                            )}
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
                              {transaction.description && ` - ${transaction.description}`}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "text-sm font-semibold shrink-0",
                              transaction.type === "income" ? "text-success" : "text-danger"
                            )}
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-muted-foreground">
                        Tidak ada hasil untuk &ldquo;{searchValue}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-foreground max-w-24 truncate">
                  {user?.name || "User"}
                </span>
                <ChevronDown className={cn(
                  "hidden sm:block h-4 w-4 text-muted-foreground transition-transform",
                  dropdownOpen && "rotate-180"
                )} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl shadow-lg border border-border py-1 z-50">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Akun Personal</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleLogout()
                        setDropdownOpen(false)
                      }}
                      disabled={logoutLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-destructive/10 transition-colors disabled:opacity-50 cursor-pointer"
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
          </div>
        </div>
      </header>

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-card md:hidden">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <button
                onClick={() => {
                  setMobileSearchOpen(false)
                  handleClearSearch()
                }}
                className="p-2 -ml-2 rounded-lg hover:bg-muted"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  autoFocus
                  className="w-full h-10 pl-9 pr-4 bg-muted border-0 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-border">
                  {searchResults.map((transaction) => (
                    <button
                      key={transaction.id}
                      onClick={handleResultClick}
                      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors text-left cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          transaction.type === "income"
                            ? "bg-success-bg text-success"
                            : "bg-danger-bg text-danger"
                        )}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {transaction.category}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatShortDate(transaction.transaction_date)}
                          {transaction.description && ` - ${transaction.description}`}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold shrink-0",
                          transaction.type === "income" ? "text-success" : "text-danger"
                        )}
                      >
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                    </button>
                  ))}
                </div>
              ) : searchValue.length >= 2 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Tidak ada hasil untuk &ldquo;{searchValue}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Ketik minimal 2 karakter untuk mencari
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
