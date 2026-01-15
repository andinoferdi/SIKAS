"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Branding */}
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="SIKAS" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-semibold text-foreground">SIKAS</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-neutral-600">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Login
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </nav>

          {/* Copyright */}
          <div className="text-center text-xs text-neutral-500">
            <p>&copy; 2026 SIKAS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
