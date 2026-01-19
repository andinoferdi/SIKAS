import { cn } from "@/lib/utils"
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, Scale } from "lucide-react"

interface SummaryCardProps {
  income: number
  expense: number
  month?: number
  year?: number
}

export function SummaryCard({ income, expense, month = getCurrentMonth(), year = getCurrentYear() }: SummaryCardProps) {
  const net = income - expense

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-foreground text-base">Ringkasan Bulanan</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {getMonthName(month)} {year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-success-bg border border-success-border">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-success-bg-dark flex items-center justify-center shrink-0">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium text-success-text mb-0.5">Pemasukan</p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-success-text truncate">
              +{formatCurrency(income)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-danger-bg border border-danger-border">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-danger-bg-dark flex items-center justify-center shrink-0">
            <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 text-danger" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-medium text-danger-text mb-0.5">Pengeluaran</p>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-danger-text truncate">
              -{formatCurrency(expense)}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex items-center gap-2.5 p-3.5 rounded-xl border",
            net >= 0
              ? "bg-primary/5 border-primary/20"
              : "bg-warning-bg border-warning-border"
          )}
        >
          <div
            className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0",
              net >= 0 ? "bg-primary/10" : "bg-warning-bg-dark"
            )}
          >
            <Scale className={cn("h-4 w-4 sm:h-5 sm:w-5", net >= 0 ? "text-primary" : "text-warning")} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className={cn("text-xs font-medium mb-0.5", net >= 0 ? "text-primary" : "text-warning-text")}>
              Selisih
            </p>
            <p className={cn("text-xs sm:text-sm md:text-base lg:text-lg font-bold truncate", net >= 0 ? "text-primary" : "text-warning-text")}>
              {net >= 0 ? "+" : ""}
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
