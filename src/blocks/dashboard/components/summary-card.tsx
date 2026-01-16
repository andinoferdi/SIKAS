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
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-neutral-900 text-base">Ringkasan Bulanan</h3>
          <p className="text-sm text-neutral-500 mt-0.5">
            {getMonthName(month)} {year}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Income */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-700 mb-0.5">Pemasukan</p>
            <p className="text-base sm:text-lg font-bold text-emerald-700 truncate">
              +{formatCurrency(income)}
            </p>
          </div>
        </div>

        {/* Expense */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-red-600 mb-0.5">Pengeluaran</p>
            <p className="text-base sm:text-lg font-bold text-red-600 truncate">
              -{formatCurrency(expense)}
            </p>
          </div>
        </div>

        {/* Net */}
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border",
            net >= 0
              ? "bg-sky-50 border-sky-100"
              : "bg-amber-50 border-amber-100"
          )}
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              net >= 0 ? "bg-sky-100" : "bg-amber-100"
            )}
          >
            <Scale className={cn("h-5 w-5", net >= 0 ? "text-sky-600" : "text-amber-600")} />
          </div>
          <div className="min-w-0">
            <p className={cn("text-xs font-medium mb-0.5", net >= 0 ? "text-sky-700" : "text-amber-700")}>
              Selisih
            </p>
            <p className={cn("text-base sm:text-lg font-bold truncate", net >= 0 ? "text-sky-700" : "text-amber-700")}>
              {net >= 0 ? "+" : ""}
              {formatCurrency(net)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
