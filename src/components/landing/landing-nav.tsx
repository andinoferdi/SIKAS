"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="SIKAS" width={32} height={32} className="h-8 w-8 object-contain" />
          <span className="hidden sm:inline font-semibold text-foreground">SIKAS</span>
        </Link>

        {/* CTA Button */}
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    </nav>
  )
}
