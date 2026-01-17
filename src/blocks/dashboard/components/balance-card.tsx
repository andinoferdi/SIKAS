import { formatCurrency } from "@/lib/utils/format"
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
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:shadow-lg"
      style={{
        background: isMbanking
          ? "linear-gradient(to bottom right, var(--gradient-mbanking-from), var(--gradient-mbanking-to))"
          : "linear-gradient(to bottom right, var(--gradient-cash-from), var(--gradient-cash-to))",
      }}
    >
 
      <div
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20"
        style={{
          backgroundColor: isMbanking ? "var(--gradient-mbanking-from)" : "var(--gradient-cash-from)",
        }}
      />
      <div
        className="absolute -right-2 top-12 w-16 h-16 rounded-full opacity-10"
        style={{
          backgroundColor: isMbanking ? "var(--gradient-mbanking-from)" : "var(--gradient-cash-from)",
        }}
      />

      <div className="relative z-10">
    
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-on-surface-subtle backdrop-blur-sm flex items-center justify-center">
            {isMbanking ? (
              <Smartphone className="w-5 h-5 text-on-surface" />
            ) : (
              <Banknote className="w-5 h-5 text-on-surface" />
            )}
          </div>
          <span className="text-on-surface-variant text-sm font-medium">{title}</span>
        </div>

       
        <div>
          <p className="text-on-surface-muted text-xs font-medium mb-1">Saldo</p>
          <p className="text-on-surface text-2xl sm:text-3xl font-bold tracking-tight">
            {formatCurrency(amount)}
          </p>
        </div>
      </div>
    </div>
  )
}
