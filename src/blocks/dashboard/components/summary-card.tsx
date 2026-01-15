import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface SummaryCardProps {
  income: number
  expense: number
  month?: number
  year?: number
}

export function SummaryCard({ income, expense, month = getCurrentMonth(), year = getCurrentYear() }: SummaryCardProps) {
  const net = income - expense

  return (
    <Card className="shadow-sm border-neutral-200">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground text-lg">
          Ringkasan {getMonthName(month)} {year}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="rounded-lg bg-success-bg p-4 border border-success-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-success" />
            <p className="text-xs font-medium text-success-text">Pemasukan</p>
          </div>
          <p className="text-base sm:text-lg font-bold text-success-text">+{formatCurrency(income)}</p>
        </div>

        <div className="rounded-lg bg-danger-bg p-4 border border-danger-border">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-danger" />
            <p className="text-xs font-medium text-danger-text">Pengeluaran</p>
          </div>
          <p className="text-base sm:text-lg font-bold text-danger-text">-{formatCurrency(expense)}</p>
        </div>

        <div
          className={cn(
            "rounded-lg p-4 border",
            net >= 0 ? "bg-sky-50 border-sky-100" : "bg-warning-bg border-warning-border",
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <Minus className={cn("h-4 w-4", net >= 0 ? "text-sky-600" : "text-warning")} />
            <p className={cn("text-xs font-medium", net >= 0 ? "text-sky-700" : "text-warning-text")}>Selisih</p>
          </div>
          <p className={cn("text-base sm:text-lg font-bold", net >= 0 ? "text-sky-700" : "text-warning-text")}>
            {net >= 0 ? "+" : ""}
            {formatCurrency(net)}
          </p>
        </div>
      </div>
    </Card>
  )
}
