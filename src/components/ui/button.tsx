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
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-sm hover:shadow-md focus:ring-primary/50":
              variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 focus:ring-muted-foreground/50":
              variant === "secondary",
            "border border-border bg-card text-foreground hover:bg-muted hover:border-muted-foreground/30 active:bg-muted/80 focus:ring-muted-foreground/50":
              variant === "outline",
            "bg-transparent text-foreground hover:bg-muted active:bg-muted/80 focus:ring-muted-foreground/50":
              variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 shadow-sm hover:shadow-md focus:ring-destructive/50":
              variant === "danger",
          },
          {
            "h-9 px-3.5 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-5 text-base": size === "lg",
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
