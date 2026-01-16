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
            "bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700 shadow-sm hover:shadow-md focus:ring-sky-500/50":
              variant === "primary",
            "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300 focus:ring-neutral-500/50":
              variant === "secondary",
            "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 focus:ring-neutral-500/50":
              variant === "outline",
            "bg-transparent text-neutral-700 hover:bg-neutral-100 active:bg-neutral-200 focus:ring-neutral-500/50":
              variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md focus:ring-red-500/50":
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
