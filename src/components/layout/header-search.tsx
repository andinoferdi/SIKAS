"use client"

import { useRef, useEffect } from "react"
import { Search, Loader2, X, TrendingUp, TrendingDown } from "lucide-react"
import type { Transaction } from "@/types"
import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { useLenisPanel } from "@/components/scroll"

interface HeaderSearchProps {
  searchValue: string
  searchResults: Transaction[]
  searchLoading: boolean
  showSearchResults: boolean
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onResultClick: () => void
  onCloseResults: () => void
  onFocus: () => void
}

export function HeaderSearch({
  searchValue,
  searchResults,
  searchLoading,
  showSearchResults,
  onSearchChange,
  onClearSearch,
  onResultClick,
  onCloseResults,
  onFocus,
}: HeaderSearchProps) {
  const searchRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Daftar hasil mount bersyarat, jadi instance dibuat ulang saat ia muncul.
  useLenisPanel(resultsRef, [showSearchResults, searchResults])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        onCloseResults()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onCloseResults])

  return (
    <div ref={searchRef} className="hidden md:block relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={onFocus}
          className="w-56 lg:w-64 h-10 pl-9 pr-9 bg-muted border-0 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
        />
        {searchLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        {!searchLoading && searchValue && (
          <button
            onClick={onClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showSearchResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50">
          {searchResults.length > 0 ? (
            <div ref={resultsRef} className="max-h-80 overflow-y-auto">
              {searchResults.map((transaction) => (
                <button
                  key={transaction.id}
                  onClick={onResultClick}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left border-b border-border last:border-0"
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
                    <p className="text-sm text-muted-foreground truncate">
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
  )
}
