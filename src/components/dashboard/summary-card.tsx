import { Card } from "@/components/ui/card"
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"

interface SummaryCardProps {
  income: number
  expense: number
  month?: number
  year?: number
}

export function SummaryCard({
  income,
  expense,
  month = getCurrentMonth(),
  year = getCurrentYear(),
}: SummaryCardProps) {
  const net = income - expense

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-zinc-900 dark:text-white">
          Ringkasan {getMonthName(month)} {year}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Pemasukan</p>
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            +{formatCurrency(income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Pengeluaran</p>
          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
            -{formatCurrency(expense)}
          </p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Selisih</p>
          <p
            className={`text-sm font-semibold ${
              net >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {net >= 0 ? "+" : ""}
            {formatCurrency(net)}
          </p>
        </div>
      </div>
    </Card>
  )
}
