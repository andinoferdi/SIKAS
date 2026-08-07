"use client"

import { Search, X, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import type { Transaction } from "@/types"
import { formatCurrency, formatShortDate } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface MobileSearchModalProps {
  isOpen: boolean
  onClose: () => void
  searchValue: string
  searchResults: Transaction[]
  searchLoading: boolean
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  onResultClick: () => void
}

export function MobileSearchModal({
  isOpen,
  onClose,
  searchValue,
  searchResults,
  searchLoading,
  onSearchChange,
  onClearSearch,
  onResultClick,
}: MobileSearchModalProps) {
  if (!isOpen) return null

  const handleClose = () => {
    onClose()
    onClearSearch()
  }

  return (
    <div className="fixed inset-0 z-50 bg-card md:hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <button
            onClick={handleClose}
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
              onChange={(e) => onSearchChange(e.target.value)}
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
                  onClick={onResultClick}
                  className="w-full flex items-center gap-3 px-4 py-4 hover:bg-muted transition-colors text-left"
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
  )
}
