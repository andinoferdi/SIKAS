import { cn } from "@/lib/utils"
import { type InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "w-full h-12 px-4 rounded-lg border bg-input-bg text-foreground placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all duration-200",
          error
            ? "border-input-error focus:ring-input-error focus:border-input-error"
            : "border-input-border focus:ring-input-focus focus:border-input-focus",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-2 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
})

Input.displayName = "Input"

export { Input }
