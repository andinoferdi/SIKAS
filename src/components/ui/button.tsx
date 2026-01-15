import { cn } from "@/lib/utils"
import { type ButtonHTMLAttributes, forwardRef } from "react"

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
          "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          {
            "bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover active:brightness-90 hover:shadow-lg hover:shadow-btn-primary-bg/20 focus:ring-ring-focus":
              variant === "primary",
            "bg-btn-secondary-bg text-btn-secondary-text hover:bg-btn-secondary-hover active:brightness-95 focus:ring-ring-focus":
              variant === "secondary",
            "border border-btn-outline-border bg-transparent text-foreground hover:bg-btn-outline-hover active:brightness-95 focus:ring-ring-focus":
              variant === "outline",
            "bg-transparent text-foreground hover:bg-btn-ghost-hover active:brightness-95 focus:ring-ring-focus":
              variant === "ghost",
            "bg-danger text-white hover:bg-danger-hover active:brightness-90 hover:shadow-lg hover:shadow-danger/20 focus:ring-danger":
              variant === "danger",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button }
