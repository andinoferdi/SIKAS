"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { startPageScroll, stopPageScroll } from "@/components/scroll"

const NAV_LINKS = [
  { href: "#fitur", label: "Fitur" },
  { href: "#tentang", label: "Tentang" },
  { href: "/guide", label: "Panduan" },
  { href: "/faq", label: "FAQ" },
]

export function LandingNav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  /*
    Status "sudah di-scroll" dibaca dari sentinel setinggi 1px di paling
    atas halaman, bukan dari listener scroll. IntersectionObserver hanya
    bekerja saat sentinel melewati batas viewport, jadi tidak ada
    re-render tiap frame seperti pada window.addEventListener("scroll").
  */
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    stopPageScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      startPageScroll()
    }
  }, [isMenuOpen])

  const shellClass = isScrolled
    ? "border-border bg-card/90 backdrop-blur-sm"
    : "border-transparent bg-transparent"

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <header
        className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 ${shellClass}`}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-18 md:px-8">
          <Link href="/" className="flex items-center" aria-label="SIKAS, beranda">
            <Image
              src="/images/logo.png"
              alt="SIKAS"
              width={120}
              height={36}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigasi utama">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-btn-primary-hover"
            >
              Masuk
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={isMenuOpen}
            aria-controls="menu-mobile"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-foreground lg:hidden"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {isMenuOpen ? (
        <div
          id="menu-mobile"
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-background px-5 lg:hidden"
        >
          <nav className="flex flex-col" aria-label="Navigasi mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="border-b border-border py-4 text-base text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="mt-8 rounded-full bg-primary py-3 text-center text-base font-semibold text-primary-foreground"
            >
              Masuk
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  )
}
