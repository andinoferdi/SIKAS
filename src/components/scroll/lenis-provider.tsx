"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/*
  Lenis memanggil preventDefault pada setiap event roda, jadi container yang
  bisa di-scroll sendiri (modal, panel chatbot, dropdown) ikut mati: rodanya
  ditelan dan pengguna terpaksa menyeret scrollbar. Menandai tiap container
  dengan data-lenis-prevent sudah dilakukan, tapi cara itu bergantung pada
  ingatan dan pernah gagal di repo ini. Pemeriksaan ini menutup celahnya:
  elemen mana pun yang memang punya area gulir sendiri otomatis dilepas.
*/
const bisaDiScrollSendiri = (node: HTMLElement): boolean => {
  if (node.hasAttribute("data-lenis-prevent")) return true

  const { overflowY, overflowX } = getComputedStyle(node)
  const gulirTegak = /(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight
  const gulirDatar = /(auto|scroll)/.test(overflowX) && node.scrollWidth > node.clientWidth

  return gulirTegak || gulirDatar
}

/*
  Lenis menggerakkan smooth scroll, dan ticker GSAP yang menggerakkan Lenis
  supaya ScrollTrigger dan Lenis memakai satu jam yang sama. Saat pengguna
  meminta reduced motion, Lenis tidak dibuat sama sekali dan scroll native
  tetap berfungsi penuh.
*/
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Setiap muat ulang halaman mulai dari atas, browser tidak boleh memulihkan
  // posisi scroll sebelumnya. Sekali saat mount, bukan tiap pindah halaman.
  useEffect(() => {
    window.history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    /*
      Smooth scroll hanya untuk halaman publik, tempat ia memang dipasangkan
      dengan animasi ScrollTrigger. Dashboard adalah alat kerja yang dipakai
      berulang setiap hari, dan jeda gulir di sana hanya menambah beban tanpa
      memberi apa pun.
    */
    if (pathname?.startsWith("/dashboard")) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const lenis = new Lenis({ autoRaf: false, lerp: 0.12, prevent: bisaDiScrollSendiri })
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
  }, [pathname])

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
