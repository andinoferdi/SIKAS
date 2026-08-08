"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/*
  Lenis menggerakkan smooth scroll, dan ticker GSAP yang menggerakkan Lenis
  supaya ScrollTrigger dan Lenis memakai satu jam yang sama. Saat pengguna
  meminta reduced motion, Lenis tidak dibuat sama sekali dan scroll native
  tetap berfungsi penuh.
*/
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setiap muat ulang halaman mulai dari atas, browser tidak boleh
    // memulihkan posisi scroll sebelumnya.
    window.history.scrollRestoration = "manual"
    window.scrollTo(0, 0)

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const lenis = new Lenis({ autoRaf: false, lerp: 0.12 })
    ;(window as unknown as { __lenis?: Lenis }).__lenis = lenis

    lenis.on("scroll", ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      delete (window as unknown as { __lenis?: Lenis }).__lenis
    }
  }, [])

  return <>{children}</>
}

export function stopPageScroll() {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
  lenis?.stop()
  document.documentElement.style.overflow = "hidden"
}

export function startPageScroll() {
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
  lenis?.start()
  document.documentElement.style.overflow = ""
}
