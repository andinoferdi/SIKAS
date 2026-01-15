import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface BalanceCardProps {
  title: string
  amount: number
  type: "mbanking" | "cash"
}

export function BalanceCard({ title, amount, type }: BalanceCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        type === "mbanking"
          ? "bg-gradient-to-br from-blue-500 to-blue-600"
          : "bg-gradient-to-br from-emerald-500 to-emerald-600"
      )}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          {type === "mbanking" ? (
            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white/80"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          )}
          <span className="text-sm text-white/80">{title}</span>
        </div>
        <p className="text-xl font-bold text-white">
          {formatCurrency(amount)}
        </p>
      </div>
    </Card>
  )
}
