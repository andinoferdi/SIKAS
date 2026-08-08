import { formatCurrency } from "@/lib/utils/format"
import { Smartphone, Banknote } from "lucide-react"

interface BalanceCardProps {
  title: string
  amount: number
  type: "mbanking" | "cash"
}

export function BalanceCard({ title, amount, type }: BalanceCardProps) {
  const isMbanking = type === "mbanking"
  const Icon = isMbanking ? Smartphone : Banknote

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/30 sm:p-5">
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
            isMbanking ? "bg-fund-mbanking/10" : "bg-fund-cash/10"
          }`}
        >
          <Icon className={`h-5 w-5 ${isMbanking ? "text-fund-mbanking" : "text-fund-cash"}`} />
        </div>
        <span className="truncate text-sm font-medium text-muted-foreground">{title}</span>
      </div>

      <p className="mt-3 text-xl font-bold tracking-tight text-foreground sm:mt-4 sm:text-2xl">
        {formatCurrency(amount)}
      </p>
    </div>
  )
}
