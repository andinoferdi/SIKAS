import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { CreditCard, Wallet } from "lucide-react"

interface BalanceCardProps {
  title: string
  amount: number
  type: "mbanking" | "cash"
}

export function BalanceCard({ title, amount, type }: BalanceCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300",
        type === "mbanking"
          ? "bg-linear-to-br from-gradient-mbanking-from to-gradient-mbanking-to text-primary-foreground"
          : "bg-linear-to-br from-gradient-cash-from to-gradient-cash-to text-primary-foreground",
      )}
    >
      <div className="relative z-10 p-4 sm:p-5 lg:p-6 flex flex-col justify-between min-h-35 sm:min-h-40">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-primary-foreground/20 rounded-lg sm:rounded-xl backdrop-blur-md">
            {type === "mbanking" ? (
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            ) : (
              <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            )}
          </div>
          <span className="text-sm sm:text-base font-medium text-primary-foreground tracking-wide opacity-90">{title}</span>
        </div>
        <div>
          <p className="text-primary-foreground/80 text-xs sm:text-sm font-medium mb-1">Total Balance</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary-foreground tracking-tight">{formatCurrency(amount)}</p>
        </div>
      </div>
    </Card>
  )
}
