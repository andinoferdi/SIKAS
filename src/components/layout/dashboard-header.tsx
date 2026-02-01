"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Search } from "lucide-react"
import { useCurrentUser } from "@/hooks"
import { cn } from "@/lib/utils"
import { useHeaderSearch } from "@/components/layout/hooks"
import { HeaderSearch } from "@/components/layout/header-search"
import { HeaderUserDropdown } from "@/components/layout/header-user-dropdown"
import { MobileSearchModal } from "@/components/layout/mobile-search-modal"

const MIN_SCROLL = 10

function getPageTitle(path: string) {
  if (path === "/dashboard") return "Beranda"
  if (path === "/dashboard/transactions") return "Riwayat Transaksi"
  if (path === "/dashboard/transactions/add") return "Tambah Transaksi"
  return "Dashboard"
}

export function DashboardHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { data: user } = useCurrentUser()

  const {
    searchValue,
    searchResults,
    searchLoading,
    showSearchResults,
    handleSearchChange,
    handleClearSearch,
    handleResultClick,
    closeResults,
    openResultsIfNeeded,
  } = useHeaderSearch()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > MIN_SCROLL)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleMobileResultClick = () => {
    handleResultClick()
    setMobileSearchOpen(false)
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
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="SIKAS"
                  width={20}
                  height={20}
                  className="object-contain"
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

            <HeaderSearch
              searchValue={searchValue}
              searchResults={searchResults}
              searchLoading={searchLoading}
              showSearchResults={showSearchResults}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              onResultClick={handleResultClick}
              onCloseResults={closeResults}
              onFocus={openResultsIfNeeded}
            />

            <HeaderUserDropdown userName={user?.name} />
          </div>
        </div>
      </header>

      <MobileSearchModal
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        searchValue={searchValue}
        searchResults={searchResults}
        searchLoading={searchLoading}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onResultClick={handleMobileResultClick}
      />
    </>
  )
}
