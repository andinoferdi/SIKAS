"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="SIKAS"
              width={24}
              height={24}
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <span className="font-bold text-lg text-neutral-900">SIKAS</span>
        </Link>

        {/* Nav Links - Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#fitur" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
            Fitur
          </Link>
          <Link href="#tentang" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">
            Tentang
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium text-neutral-700 hover:text-neutral-900">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button className="text-sm font-medium px-5">
              Daftar
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
