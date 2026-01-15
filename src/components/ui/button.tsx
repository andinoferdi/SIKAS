import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover focus:ring-ring-focus":
              variant === "primary",
            "bg-btn-secondary-bg text-btn-secondary-text hover:bg-btn-secondary-hover focus:ring-ring-focus":
              variant === "secondary",
            "border border-btn-outline-border bg-transparent hover:bg-btn-outline-hover focus:ring-ring-focus":
              variant === "outline",
            "bg-transparent hover:bg-btn-ghost-hover focus:ring-ring-focus":
              variant === "ghost",
            "bg-danger text-white hover:bg-danger-hover focus:ring-ring-error":
              variant === "danger",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
