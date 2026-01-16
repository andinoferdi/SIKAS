"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import { Search, LogOut, TrendingUp, TrendingDown, Loader2, X, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useEffect, useState, useRef } from "react"
import { userService, transactionService } from "@/service"
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
    if (path === "/dashboard/add") return "Tambah Transaksi"
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
    setMobileSearchOpen(false)
    router.push("/dashboard/transactions")
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 bg-white border-b transition-all duration-200",
          scrolled ? "border-neutral-200 shadow-sm" : "border-transparent"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          {/* Left: Logo (mobile) / Page Title (desktop) */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="lg:hidden text-lg font-bold text-sky-600">SIKAS</span>
            <h1 className="hidden lg:block text-lg font-semibold text-neutral-900 truncate">
              {getPageTitle(pathname)}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(true)}
              className="md:hidden p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5 text-neutral-600" />
            </button>

            {/* Desktop Search */}
            <div ref={searchRef} className="hidden md:block relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                  className="w-56 lg:w-64 h-10 pl-9 pr-9 bg-neutral-100 border-0 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:bg-white transition-all"
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 animate-spin" />
                )}
                {!searchLoading && searchValue && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50">
                  {searchResults.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((transaction) => (
                        <button
                          key={transaction.id}
                          onClick={handleResultClick}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-100 last:border-0"
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                              transaction.type === "income"
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-red-100 text-red-500"
                            )}
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">
                              {transaction.category}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">
                              {formatShortDate(transaction.transaction_date)}
                              {transaction.description && ` - ${transaction.description}`}
                            </p>
                          </div>
                          <p
                            className={cn(
                              "text-sm font-semibold shrink-0",
                              transaction.type === "income" ? "text-emerald-600" : "text-red-500"
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
                      <p className="text-sm text-neutral-500">
                        Tidak ada hasil untuk &ldquo;{searchValue}&rdquo;
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm font-medium shrink-0">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden sm:block text-sm font-medium text-neutral-700 max-w-24 truncate">
                  {user?.name || "User"}
                </span>
                <ChevronDown className={cn(
                  "hidden sm:block h-4 w-4 text-neutral-400 transition-transform",
                  dropdownOpen && "rotate-180"
                )} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-sm font-medium text-neutral-900">{user?.name || "User"}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Akun Personal</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        handleLogout()
                        setDropdownOpen(false)
                      }}
                      disabled={logoutLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-white md:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Search Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200">
              <button
                onClick={() => {
                  setMobileSearchOpen(false)
                  handleClearSearch()
                }}
                className="p-2 -ml-2 rounded-lg hover:bg-neutral-100"
              >
                <X className="h-5 w-5 text-neutral-600" />
              </button>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchValue}
                  onChange={handleSearchChange}
                  autoFocus
                  className="w-full h-10 pl-9 pr-4 bg-neutral-100 border-0 rounded-xl text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Mobile Search Results */}
            <div className="flex-1 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="divide-y divide-neutral-100">
                  {searchResults.map((transaction) => (
                    <button
                      key={transaction.id}
                      onClick={handleResultClick}
                      className="w-full flex items-center gap-3 px-4 py-4 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          transaction.type === "income"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-500"
                        )}
                      >
                        {transaction.type === "income" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : (
                          <TrendingDown className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {transaction.category}
                        </p>
                        <p className="text-xs text-neutral-500 truncate">
                          {formatShortDate(transaction.transaction_date)}
                          {transaction.description && ` - ${transaction.description}`}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-semibold shrink-0",
                          transaction.type === "income" ? "text-emerald-600" : "text-red-500"
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
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500 text-center">
                    Tidak ada hasil untuk &ldquo;{searchValue}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                    <Search className="h-7 w-7 text-neutral-400" />
                  </div>
                  <p className="text-sm text-neutral-500 text-center">
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
