import { useQuery } from "@tanstack/react-query"
import { summaryService } from "@/services"

export function useMonthlySummary() {
  return useQuery({
    queryKey: ["summary"],
    queryFn: () => summaryService.getMonthlySummary(),
  })
}
