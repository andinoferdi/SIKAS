import { MonthlySummary } from "@/types"

interface SummaryResponse {
  summary?: MonthlySummary
  error?: string
}

export const summaryService = {
  async getMonthlySummary(): Promise<MonthlySummary> {
    try {
      const res = await fetch("/api/summary")
      const data: SummaryResponse = await res.json()
      return data.summary || { total_income: 0, total_expense: 0, net: 0 }
    } catch {
      return { total_income: 0, total_expense: 0, net: 0 }
    }
  },
}
