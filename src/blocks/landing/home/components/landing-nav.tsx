"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export function LandingNav() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md">
      <div className="flex h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="SIKAS"
              width={24}
              height={24}
              className="object-contain filter brightness-0 invert"
            />
          </div>
          <span className="font-bold text-lg text-foreground">SIKAS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#fitur" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Fitur
          </Link>
          <Link href="#tentang" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Tentang
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-sm font-medium">
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
