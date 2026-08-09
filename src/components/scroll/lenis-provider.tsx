"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { LENIS_PANEL_ATTRIBUTE } from "@/components/scroll/use-lenis-panel"

gsap.registerPlugin(ScrollTrigger)

/*
  Lenis memanggil preventDefault pada setiap event roda, jadi container yang
  bisa digulir sendiri ikut mati kalau dibiarkan: rodanya ditelan dan pengguna
  terpaksa menyeret scrollbar.

  Panel yang memakai useLenisPanel punya Lenis sendiri dan menandai dirinya,
  jadi root harus melepasnya. Bukan dengan mengabaikan event, melainkan dengan
  tidak mencegatnya sama sekali, sebab root tetap perlu menerima event itu saat
  panel sudah mentok dan menyerahkan guliran ke halaman.

  Container yang bisa digulir tapi belum memakai hook tetap dicegat sebagai
  jaring pengaman, supaya minimal bisa digulir secara native alih-alih mati.
*/
const perluDilepasDariLenisRoot = (node: HTMLElement): boolean => {
  if (node.hasAttribute(LENIS_PANEL_ATTRIBUTE)) return false
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
  // Setiap muat ulang halaman mulai dari atas, browser tidak boleh memulihkan
  // posisi scroll sebelumnya. Sekali saat mount, bukan tiap pindah halaman.
  useEffect(() => {
    window.history.scrollRestoration = "manual"
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return

    const lenis = new Lenis({
      autoRaf: false,
      lerp: 0.12,
      prevent: perluDilepasDariLenisRoot,
    })
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
