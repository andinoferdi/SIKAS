import { Suspense } from "react"
import TransactionsPage from "@/blocks/dashboard/transactions"

export default function Page() {
  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <TransactionsPage />
    </Suspense>
  )
}
