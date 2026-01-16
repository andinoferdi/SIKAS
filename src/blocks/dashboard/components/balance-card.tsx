import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import { Smartphone, Banknote } from "lucide-react"

interface BalanceCardProps {
  title: string
  amount: number
  type: "mbanking" | "cash"
}

export function BalanceCard({ title, amount, type }: BalanceCardProps) {
  const isMbanking = type === "mbanking"

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg",
        isMbanking
          ? "bg-linear-to-br from-sky-500 to-sky-600"
          : "bg-linear-to-br from-emerald-500 to-emerald-600"
      )}
    >
      {/* Decorative circles */}
      <div
        className={cn(
          "absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20",
          isMbanking ? "bg-sky-300" : "bg-emerald-300"
        )}
      />
      <div
        className={cn(
          "absolute -right-2 top-12 w-16 h-16 rounded-full opacity-10",
          isMbanking ? "bg-sky-200" : "bg-emerald-200"
        )}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isMbanking ? (
              <Smartphone className="w-5 h-5 text-white" />
            ) : (
              <Banknote className="w-5 h-5 text-white" />
            )}
          </div>
          <span className="text-white/90 text-sm font-medium">{title}</span>
        </div>

        {/* Amount */}
        <div>
          <p className="text-white/70 text-xs font-medium mb-1">Saldo</p>
          <p className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    </div>
  )
}
