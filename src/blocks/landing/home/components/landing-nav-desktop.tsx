"use client"

import { useState, useRef, useEffect, memo } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
  icon: React.ElementType
  title: string
  description: string
}

interface LandingNavDesktopProps {
  features: Feature[]
}

export const LandingNavDesktop = memo(function LandingNavDesktop({ features }: LandingNavDesktopProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsDropdownOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false)
    }, 150)
  }

  return (
    <nav className="hidden lg:flex items-center gap-1">
      <div
        ref={dropdownRef}
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          className={cn(
            "flex items-center gap-1 px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
            isDropdownOpen && "text-foreground"
          )}
        >
          Fitur
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isDropdownOpen && "rotate-180"
            )}
          />
        </button>

        <div
          className={cn(
            "absolute top-full left-0 pt-2 transition-all duration-200",
            isDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible -translate-y-2"
          )}
        >
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 p-4 min-w-100">
            <div className="grid grid-cols-1 gap-1">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href="#fitur"
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-[15px]">
                      {feature.title}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link
        href="#tentang"
        className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Tentang
      </Link>
      <Link
        href="/guide"
        className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Panduan
      </Link>
      <Link
        href="/faq"
        className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        FAQ
      </Link>

      <Link
        href="/login"
        className="ml-4 px-6 py-2.5 text-[15px] font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
      >
        Login
      </Link>
    </nav>
  )
})
