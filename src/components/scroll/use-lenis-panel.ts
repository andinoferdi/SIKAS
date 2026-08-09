"use client"

import { useEffect, type RefObject } from "react"
import Lenis from "lenis"
import { gsap } from "gsap"

/* Penanda bahwa elemen sudah punya Lenis sendiri. Root memakai ini untuk
   membedakan panel ber-hook dari container biasa. */
export const LENIS_PANEL_ATTRIBUTE = "data-lenis-panel"

/*
  Instance Lenis bersarang untuk panel yang bisa digulir sendiri (daftar pesan
  chatbot, badan modal, dropdown), supaya isinya bergulir dengan smoothing yang
  sama seperti halaman. Lenis mengoordinasi instance bersarang sendiri: selama
  panel masih bisa bergulir ke arah roda, ia menandai event dengan
  lenisStopPropagation sehingga instance root mengabaikannya; di tepi tanda itu
  tidak dipasang dan halaman yang mengambil alih. Karena itu panel yang terlalu
  pendek untuk digulir tidak pernah bisa membekukan halaman, dan
  data-lenis-prevent tidak diperlukan pada elemen ini.

  naiveDimensions membaca scrollHeight secara live pada setiap guliran, jadi
  panel yang isinya tumbuh (chat yang sedang streaming, hasil pencarian yang
  berubah) tidak pernah bekerja dengan batas gulir yang basi.

  Kirim `deps` untuk panel yang mount bersyarat (dropdown, modal) agar
  instance-nya dibuat saat panel itu muncul.
*/
export function useLenisPanel(
  ref: RefObject<HTMLElement | null>,
  deps: readonly unknown[] = []
) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    el.setAttribute(LENIS_PANEL_ATTRIBUTE, "")

    const lenis = new Lenis({
      wrapper: el,
      content: el,
      autoRaf: false,
      lerp: 0.12,
      naiveDimensions: true,
    })
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)

    /*
      Serah terima yang tegas di tepi. Lenis menandai lenisStopPropagation dari
      posisi teranimasinya, jadi selama panel masih meluncur menuju tepi ia
      terus menelan event roda dan halaman terasa tertahan belasan tick sebelum
      ikut bergerak. Niat pengguna ada di targetScroll: begitu target sudah
      menyentuh tepi pada arah roda, tanda itu dibersihkan supaya Lenis root
      (yang mendengarkan di window, selalu setelah listener elemen ini)
      langsung menangani event tersebut.
    */
    const serahTerimaDiTepi = (event: WheelEvent) => {
      const diBawah = event.deltaY > 0 && lenis.targetScroll >= lenis.limit - 1
      const diAtas = event.deltaY < 0 && lenis.targetScroll <= 1
      if (diBawah || diAtas) {
        ;(event as WheelEvent & { lenisStopPropagation?: boolean }).lenisStopPropagation = false
      }
    }
    el.addEventListener("wheel", serahTerimaDiTepi, { passive: true })

    return () => {
      el.removeEventListener("wheel", serahTerimaDiTepi)
      el.removeAttribute(LENIS_PANEL_ATTRIBUTE)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
