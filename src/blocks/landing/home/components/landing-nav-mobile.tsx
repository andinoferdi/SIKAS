"use client"

import { useState, memo } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Feature {
  icon: React.ElementType
  title: string
  description: string
}

interface LandingNavMobileProps {
  features: Feature[]
  isOpen: boolean
  onClose: () => void
}

export const LandingNavMobile = memo(function LandingNavMobile({
  features,
  isOpen,
  onClose
}: LandingNavMobileProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleLinkClick = () => {
    setIsDropdownOpen(false)
    onClose()
  }

  return (
    <div
      className={cn(
        "lg:hidden fixed inset-0 top-18 bg-card z-40 transition-all duration-300",
        isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
      )}
    >
      <nav className="flex flex-col p-4">
        <div className="border-b border-border/50 pb-4 mb-4">
          <button
            type="button"
            className="flex items-center justify-between w-full py-3 text-base font-medium text-foreground"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            Fitur
            <ChevronDown
              className={cn(
                "w-5 h-5 transition-transform duration-200",
                isDropdownOpen && "rotate-180"
              )}
            />
          </button>

          <div
            className={cn(
              "overflow-hidden transition-all duration-300",
              isDropdownOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="pt-2 space-y-1">
              {features.map((feature) => (
                <Link
                  key={feature.title}
                  href="#fitur"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  onClick={handleLinkClick}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">
                      {feature.title}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link
          href="#tentang"
          className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
          onClick={onClose}
        >
          Tentang
        </Link>
        <Link
          href="/guide"
          className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
          onClick={onClose}
        >
          Panduan
        </Link>
        <Link
          href="/faq"
          className="py-3 text-base font-medium text-foreground hover:text-primary transition-colors"
          onClick={onClose}
        >
          FAQ
        </Link>

        <div className="mt-6 pt-6 border-t border-border/50">
          <Link
            href="/login"
            className="block w-full py-3 text-center text-base font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-full transition-colors"
            onClick={onClose}
          >
            Login
          </Link>
        </div>
      </nav>
    </div>
  )
})
