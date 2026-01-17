import { fetcher } from "@/services/base"
import type { MonthlySummary, SummaryResponse } from "@/types"

export const summaryService = {
  async getMonthlySummary(): Promise<MonthlySummary> {
    const data = await fetcher<SummaryResponse>("/api/summary")
    return data.summary || { total_income: 0, total_expense: 0, net: 0 }
  },
}
