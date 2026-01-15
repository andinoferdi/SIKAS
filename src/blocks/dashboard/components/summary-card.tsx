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
        <h3 className="font-semibold text-text-primary">
          Ringkasan {getMonthName(month)} {year}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-text-muted mb-1">Pemasukan</p>
          <p className="text-sm font-semibold text-success">
            +{formatCurrency(income)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Pengeluaran</p>
          <p className="text-sm font-semibold text-danger">
            -{formatCurrency(expense)}
          </p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Selisih</p>
          <p
            className={`text-sm font-semibold ${
              net >= 0
                ? "text-success"
                : "text-danger"
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
