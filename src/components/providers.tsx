"use client"

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { onBroadcastMessage } from "@/lib/utils/broadcast-sync"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error) => {
            if (error.message.includes("401") || error.message.includes("Unauthorized")) {
              window.location.href = "/login"
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 0,
            retry: (failureCount, error) => {
              if (error.message.includes("401") || error.message.includes("Unauthorized")) {
                return false
              }
              return failureCount < 1
            },
            refetchOnWindowFocus: true,
          },
        },
      })
  )

  useEffect(() => {
    const unsubscribe = onBroadcastMessage((message) => {
      if (message.type === "INVALIDATE_QUERIES") {
        message.queryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }
    })
    return unsubscribe
  }, [queryClient])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

