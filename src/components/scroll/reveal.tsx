"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

/*
  Membuka anak-anak langsungnya satu per satu saat masuk viewport.
  matchMedia menangani reduced motion, jadi tidak ada kondisional yang
  tersebar di tiap section. Bila JavaScript mati, tidak ada tween yang
  dibuat dan isinya tetap terlihat.
*/
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(el.children, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      })
    })

    return () => mm.revert()
  }, [])

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  )
}
