import { cn } from "@/lib/utils"
import { SelectHTMLAttributes, forwardRef } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          ref={ref}
          className={cn(
            "w-full h-12 px-4 rounded-xl border bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent transition-colors appearance-none cursor-pointer dark:bg-zinc-800 dark:text-white dark:border-zinc-700",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-zinc-300 dark:border-zinc-700",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = "Select"

export { Select }
