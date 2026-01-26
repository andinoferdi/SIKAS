"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { transactionService } from "@/services"
import type { Transaction } from "@/types"

export function useHeaderSearch() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<Transaction[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

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

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchValue("")
    setSearchResults([])
    setShowSearchResults(false)
  }, [])

  const handleResultClick = useCallback(() => {
    setShowSearchResults(false)
    setSearchValue("")
    router.push("/dashboard/transactions")
  }, [router])

  const closeResults = useCallback(() => {
    setShowSearchResults(false)
  }, [])

  const openResultsIfNeeded = useCallback(() => {
    if (searchResults.length > 0) {
      setShowSearchResults(true)
    }
  }, [searchResults.length])

  return {
    searchValue,
    searchResults,
    searchLoading,
    showSearchResults,
    handleSearchChange,
    handleClearSearch,
    handleResultClick,
    closeResults,
    openResultsIfNeeded,
  }
}
