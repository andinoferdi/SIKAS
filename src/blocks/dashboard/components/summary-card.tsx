import { cn } from "@/lib/utils"
import { formatCurrency, getMonthName, getCurrentMonth, getCurrentYear } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, Scale } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface SummaryCardProps {
  income: number
  expense: number
  month?: number
  year?: number
}

interface SummaryRowProps {
  icon: LucideIcon
  label: string
  value: string
  tone: string
}

function SummaryRow({ icon: Icon, label, value, tone }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 sm:flex-col sm:items-start sm:justify-start sm:gap-2 sm:px-4 sm:py-0 sm:first:pl-0 sm:last:pr-0">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className={cn("h-4 w-4 shrink-0", tone)} />
        <span className="truncate text-sm text-muted-foreground">{label}</span>
      </div>
      <p className={cn("shrink-0 text-base font-semibold tabular-nums", tone)}>{value}</p>
    </div>
  )
}

export function SummaryCard({
  income,
  expense,
  month = getCurrentMonth(),
  year = getCurrentYear(),
}: SummaryCardProps) {
  const net = income - expense

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <h3 className="text-base font-semibold text-card-foreground">Ringkasan Bulanan</h3>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {getMonthName(month)} {year}
      </p>

      <div className="mt-4 divide-y divide-border sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <SummaryRow
          icon={TrendingUp}
          label="Pemasukan"
          value={`+${formatCurrency(income)}`}
          tone="text-success"
        />
        <SummaryRow
          icon={TrendingDown}
          label="Pengeluaran"
          value={`-${formatCurrency(expense)}`}
          tone="text-danger"
        />
        <SummaryRow
          icon={Scale}
          label="Selisih"
          value={`${net >= 0 ? "+" : ""}${formatCurrency(net)}`}
          tone={net >= 0 ? "text-primary-solid" : "text-warning-text"}
        />
      </div>
    </div>
  )
}
