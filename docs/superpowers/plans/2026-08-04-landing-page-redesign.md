# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menghabiskan 30 anti-pattern di landing page SIKAS lewat perbaikan token kontras, penggantian tipografi, perombakan layout jadi editorial mobile-first, dan penambahan smooth scroll Lenis plus reveal GSAP.

**Architecture:** Token warna diperbaiki sekali di `globals.css` dan dijaga oleh skrip pemeriksa kontras yang bisa gagal. Font root diganti di `layout.tsx`. Lenis dan GSAP dipasang lewat dua komponen klien baru di `src/components/scroll/`. Enam komponen landing di `src/blocks/landing/home/components/` ditulis ulang satu per satu, tiap satu bisa di-review terpisah.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, `next/font/google`, GSAP 3 dengan ScrollTrigger, Lenis 1.x, Node 20+ untuk skrip pemeriksa.

## Global Constraints

Nilai di bawah disalin persis dari `docs/superpowers/specs/2026-08-04-landing-page-redesign-design.md`. Seluruh task tunduk pada bagian ini.

- Repo ini **tidak punya test runner**. `npm run test` tidak ada. Perintah verifikasi yang sah hanya `npm run build`, `npm run lint`, `node scripts/check-contrast.mjs`, dan pemeriksaan browser manual. Jangan mengarang perintah test.
- Token warna wajib: `--primary` `#0369a1`, `--btn-primary-bg` `#0369a1`, `--btn-primary-hover` `#075985`, `--primary-surface` `#0ea5e9` (token baru), `--text-muted` `#475569`, `--success` `#047857`, `--danger` `#b91c1c`.
- Ambang kontras: 4,5:1 untuk teks normal, 3:1 untuk teks besar dan komponen UI. Tidak ada teks berwarna di bawah 4,5:1.
- Lantai ukuran teks di landing page: `0.875rem` (14px). Tidak ada `text-[9px]`, `text-[10px]`, `text-xs`, atau nilai arbitrer di bawah itu.
- Breakpoint hanya `min-width`: `sm:`, `md:`, `lg:`, `xl:`. Varian `max-*` dilarang.
- Maksimal dua breakpoint per elemen.
- Tidak ada nilai arbitrer dalam kurung siku seperti `text-[9px]` atau `w-[87.5px]`. Pakai skala Tailwind atau token bernama. Catatan: `max-w-300` dan `min-w-100` bukan arbitrer, keduanya skala spacing sah di Tailwind v4 dan setara 75rem dan 25rem.
- Target sentuh minimal 44 x 44 px untuk semua elemen interaktif.
- Tidak ada `shadow-*` di landing page. Kedalaman dibangun lewat ruang dan garis.
- Radius: `rounded-none` untuk elemen editorial, `rounded-lg` untuk elemen interaktif, `rounded-full` hanya untuk tombol utama.
- Semua animasi mati total saat `prefers-reduced-motion: reduce`.
- Copy tidak diubah kecuali disebut eksplisit di task. Redesign ini menyentuh presentasi, bukan pesan.
- Commit message memakai Conventional Commits berbahasa Indonesia dengan imperative mood, sesuai `docs/git-workflow.md` baris 44. Contoh: `fix(landing): perbaiki kontras token warna`.
- Bekerja di branch `feat/landing-page-redesign`. Jangan commit ke `main`.

---

### Task 1: Skrip pemeriksa kontras dan perbaikan token warna

Ini satu task karena skripnya tidak berguna tanpa perbaikan token, dan perbaikan token tidak terbukti tanpa skripnya. Skrip ini adalah satu-satunya gate otomatis di seluruh rencana, jadi ia dibuat lebih dulu dan harus gagal dulu sebelum token diperbaiki.

**Files:**
- Create: `scripts/check-contrast.mjs`
- Modify: `src/app/globals.css:10` (`--primary`), `:15` (`--muted-foreground`), `:72` (`--success`), `:79` (`--danger`), `:99-101` (`--btn-primary-*`), `:111` (`--text-muted`)
- Modify: `package.json` (tambah script `check:contrast`)

**Interfaces:**
- Consumes: tidak ada, ini task pertama.
- Produces: perintah `npm run check:contrast` yang keluar dengan kode 1 bila ada pasangan warna gagal. Token `--primary-surface` tersedia untuk Task 4 sampai 9.

- [ ] **Step 1: Tulis skrip pemeriksa yang akan gagal**

Buat `scripts/check-contrast.mjs`. Skrip membaca nilai asli dari `globals.css`, bukan dari daftar hardcode, supaya tidak bisa lolos karena lupa disinkronkan.

```js
// Pemeriksa kontras WCAG untuk token warna SIKAS.
// Membaca nilai langsung dari globals.css agar tidak bisa lolos karena
// daftar di sini lupa disinkronkan dengan CSS-nya.
import { readFileSync } from "node:fs"

const CSS = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8")

const readToken = (name) => {
  const match = CSS.match(new RegExp(`^\\s*--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`, "m"))
  if (!match) {
    throw new Error(`Token --${name} tidak ditemukan di globals.css atau bukan hex 6 digit.`)
  }
  return match[1]
}

const toLinear = (channel) =>
  channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}

// [tokenDepan, tokenBelakang, ambang, keterangan]
const CHECKS = [
  ["primary", "card", 4.5, "teks dan angka biru di atas kartu"],
  ["primary", "background", 4.5, "teks biru di atas latar halaman"],
  ["btn-primary-bg", "primary-foreground", 4.5, "teks putih di tombol utama"],
  ["btn-primary-hover", "primary-foreground", 4.5, "teks putih di tombol utama saat hover"],
  ["text-muted", "card", 4.5, "teks sekunder di atas kartu"],
  ["text-muted", "background", 4.5, "teks sekunder di atas latar halaman"],
  // --muted-foreground yang sebenarnya dipakai komponen lewat kelas
  // text-muted-foreground. Tanpa baris ini, kelas yang paling sering
  // dipakai di seluruh aplikasi justru tidak pernah diperiksa.
  ["muted-foreground", "card", 4.5, "kelas text-muted-foreground di atas kartu"],
  ["muted-foreground", "background", 4.5, "kelas text-muted-foreground di atas latar"],
  ["success", "card", 4.5, "nominal pemasukan"],
  ["danger", "card", 4.5, "nominal pengeluaran dan pesan error"],
  ["foreground", "card", 4.5, "teks utama"],
  // Ambang 2,5:1 disengaja. Token ini hanya untuk bidang besar tanpa teks
  // dan tanpa fungsi batas komponen, jadi ambang 3:1 tidak berlaku. Yang
  // dijaga di sini cuma agar nilainya tidak pernah dibuat lebih pucat lagi.
  ["primary-surface", "card", 2.5, "bidang dekoratif besar, bukan teks"],
]

let failed = 0

for (const [front, back, threshold, note] of CHECKS) {
  const ratio = contrast(readToken(front), readToken(back))
  const ok = ratio >= threshold
  if (!ok) failed += 1
  const status = ok ? "LOLOS" : "GAGAL"
  console.log(
    `${status}  --${front} / --${back}  ${ratio.toFixed(2)}:1  (min ${threshold}:1)  ${note}`
  )
}

if (failed > 0) {
  console.error(`\n${failed} pasangan warna gagal memenuhi ambang WCAG.`)
  process.exit(1)
}

console.log(`\nSemua ${CHECKS.length} pasangan warna lolos.`)
```

- [ ] **Step 2: Daftarkan skrip di package.json**

Tambahkan satu baris di objek `scripts`, sejajar dengan `lint` yang sudah ada.

```json
"check:contrast": "node scripts/check-contrast.mjs"
```

- [ ] **Step 3: Jalankan dan pastikan GAGAL**

Skrip harus gagal dua kali berturut-turut sebelum token diperbaiki. Kegagalan pertama membuktikan token `--primary-surface` memang belum ada.

Jalankan: `npm run check:contrast`

Diharapkan: proses berhenti dengan `Error: Token --primary-surface tidak ditemukan di globals.css atau bukan hex 6 digit.`

- [ ] **Step 4: Tambahkan token --primary-surface saja, lalu jalankan lagi**

Sisipkan satu baris tepat di bawah `--primary-foreground: #ffffff;` di `src/app/globals.css:11`:

```css
  --primary-surface: #0ea5e9;
```

Jalankan: `npm run check:contrast`

Diharapkan: keluar dengan kode 1 dan tepat 6 baris `GAGAL`, yaitu `--primary`/`--card` di 2,77:1, `--primary`/`--background` di 2,70:1, `--btn-primary-bg`/`--primary-foreground` di 2,77:1, `--btn-primary-hover`/`--primary-foreground` di 4,09:1, `--success`/`--card` di 2,56:1, dan `--danger`/`--card` di 3,74:1. Baris `--text-muted` dan `--muted-foreground` akan LOLOS di 4,84:1 karena nilai lamanya memang pas-pasan, dan tetap dinaikkan di langkah berikutnya agar punya margin.

- [ ] **Step 5: Perbaiki seluruh token warna**

Terapkan enam penggantian berikut di `src/app/globals.css`. Ganti nilainya saja, jangan ubah nama token, karena token-token ini dipakai juga oleh dashboard.

```css
/* baris 10 */
  --primary: #0369a1;

/* baris 15, dipakai Tailwind sebagai text-muted-foreground */
  --muted-foreground: #475569;

/* baris 72 */
  --success: #047857;

/* baris 79 */
  --danger: #b91c1c;

/* baris 99 dan 101 */
  --btn-primary-bg: #0369a1;
  --btn-primary-hover: #075985;

/* baris 111 */
  --text-muted: #475569;
```

Juga ganti `--ring: #0ea5e9;` di baris 22, `--input-focus: #0ea5e9;` di baris 67, dan `--ring-focus: #0ea5e9;` di baris 69 menjadi `#0369a1`, supaya cincin fokus punya kontras 3:1 terhadap latar terang.

- [ ] **Step 6: Jalankan dan pastikan LOLOS**

Jalankan: `npm run check:contrast`

Diharapkan: kode keluar 0 dan baris terakhir berbunyi `Semua 12 pasangan warna lolos.` Nilai yang harus muncul: `--primary`/`--card` 5,93:1, `--btn-primary-hover`/`--primary-foreground` 7,70:1, `--text-muted`/`--card` 7,47:1, `--muted-foreground`/`--card` 7,47:1, `--success`/`--card` 5,55:1, `--danger`/`--card` 6,54:1, dan `--primary-surface`/`--card` 2,77:1 yang LOLOS karena ambangnya 2,5:1.

- [ ] **Step 7: Pastikan build masih jalan**

Jalankan: `npm run build`

Diharapkan: selesai tanpa error. Perubahan ini murni nilai CSS, tidak ada yang bisa merusak tipe.

- [ ] **Step 8: Commit**

```bash
git add scripts/check-contrast.mjs package.json src/app/globals.css
git commit -m "fix(landing): perbaiki kontras token warna dan tambah pemeriksa WCAG"
```

---

### Task 2: Ganti font root ke Archivo dan Instrument Serif

**Files:**
- Modify: `src/app/layout.tsx:3` (import font), `:9-13` (deklarasi), `:37` (themeColor), `:48` (className body)
- Modify: `src/app/globals.css` (tambah `--font-sans`, `--font-serif`, dan skala teks di blok `@theme inline`)

**Interfaces:**
- Consumes: token warna dari Task 1.
- Produces: variabel CSS `--font-archivo` dan `--font-instrument-serif`, kelas utilitas `font-sans` dan `font-serif`, serta ukuran `text-display` dan `text-h2` yang dipakai Task 4 sampai 9.

- [ ] **Step 1: Ganti deklarasi font di layout.tsx**

Ganti baris 3, lalu ganti blok baris 9 sampai 13.

Baris 3, dari `import { Plus_Jakarta_Sans } from "next/font/google"` menjadi:

```tsx
import { Archivo, Instrument_Serif } from "next/font/google"
```

Baris 9 sampai 13, dari blok `plusJakarta` menjadi:

```tsx
// Archivo untuk seluruh teks dan UI. Variable font, jadi tidak perlu
// mendaftar weight satu per satu.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
})

// Instrument Serif hanya punya satu weight dan dipakai khusus untuk
// display dan heading.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})
```

- [ ] **Step 2: Pasang kedua variabel di body dan perbaiki themeColor**

Baris 48, dari `className={`${plusJakarta.variable} font-sans antialiased`}` menjadi:

```tsx
      <body className={`${archivo.variable} ${instrumentSerif.variable} font-sans antialiased`}>
```

Baris 37, `themeColor: "#c9b896"` adalah sisa palet beige lama dan tidak cocok dengan biru SIKAS. Ganti menjadi:

```tsx
  themeColor: "#0369a1",
```

- [ ] **Step 3: Daftarkan font dan skala teks di globals.css**

Tambahkan di dalam blok `@theme inline`, tepat sebelum kurung tutupnya di baris 309:

```css
  --font-sans: var(--font-archivo), system-ui, sans-serif;
  --font-serif: var(--font-instrument-serif), Georgia, serif;

  --text-display: clamp(2.5rem, 8vw, 5rem);
  --text-display--line-height: 1.05;
  --text-h2: clamp(1.75rem, 4vw, 2.75rem);
  --text-h2--line-height: 1.15;
```

Tailwind v4 membaca prefix `--text-` dan otomatis membuat kelas `text-display` dan `text-h2`. Utilitas `tabular-nums` sudah bawaan Tailwind, jangan buat sendiri.

- [ ] **Step 4: Verifikasi build dan lint**

Jalankan: `npm run build`
Diharapkan: selesai tanpa error, dan tidak ada peringatan soal font yang gagal diambil.

Jalankan: `npm run lint`
Diharapkan: bersih. Bila muncul `'plusJakarta' is defined but never used`, berarti deklarasi lama belum terhapus.

- [ ] **Step 5: Verifikasi visual di browser**

Jalankan: `npm run dev`, lalu buka `http://localhost:3000`.

Diharapkan: seluruh teks berubah dari Plus Jakarta Sans ke Archivo. Heading belum berubah jadi serif, karena kelas `font-serif` baru dipasang di task berikutnya. Ini benar dan bukan kegagalan.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat(landing): ganti font root ke Archivo dan Instrument Serif"
```

---

### Task 3: Pasang Lenis dan GSAP

**Files:**
- Create: `src/components/scroll/lenis-provider.tsx`
- Create: `src/components/scroll/reveal.tsx`
- Create: `src/components/scroll/index.ts`
- Modify: `src/app/globals.css` (tambah plumbing CSS Lenis di akhir berkas)
- Modify: `src/app/layout.tsx` (bungkus children dengan `LenisProvider`)
- Modify: `package.json` (tambah dependensi)

**Interfaces:**
- Consumes: font dan token dari Task 1 dan 2.
- Produces: komponen `LenisProvider`, komponen `Reveal` dengan prop `{ children: ReactNode; className?: string }`, serta fungsi `stopPageScroll()` dan `startPageScroll()` yang dipakai Task 9 untuk mengunci scroll saat menu mobile terbuka.

- [ ] **Step 1: Pasang dependensi**

Jalankan: `npm install gsap lenis`

Diharapkan: `package.json` bertambah `gsap` dan `lenis`. Jangan pasang `@gsap/react`, tidak dibutuhkan dan menambah satu dependensi tanpa manfaat di sini.

- [ ] **Step 2: Buat LenisProvider**

Buat `src/components/scroll/lenis-provider.tsx`. Pola ini menyalin `andinoferdi-portfolio/src/components/scroll/LenisProvider.tsx` yang sudah terbukti.

```tsx
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
```

- [ ] **Step 3: Buat komponen Reveal**

Buat `src/components/scroll/reveal.tsx`. Satu komponen ini dipakai seluruh section, jadi aturan animasinya hanya ada di satu tempat.

```tsx
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
```

- [ ] **Step 4: Buat barrel export**

Buat `src/components/scroll/index.ts`, mengikuti pola barrel yang sudah dipakai di `src/blocks/landing/home/components/index.ts`.

```ts
export { LenisProvider, stopPageScroll, startPageScroll } from "./lenis-provider"
export { Reveal } from "./reveal"
```

- [ ] **Step 5: Tambah plumbing CSS Lenis**

Tambahkan di akhir `src/app/globals.css`, setelah blok `@layer base`.

```css
/* Plumbing smooth scroll Lenis (https://lenis.dev) */
html.lenis,
html.lenis body {
  height: auto;
}

.lenis:not(.lenis-autoToggle).lenis-stopped {
  overflow: clip;
}

.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
```

- [ ] **Step 6: Pasang provider di layout**

Di `src/app/layout.tsx`, tambahkan import dan bungkus `children`. `LenisProvider` harus berada di dalam `Providers` supaya tetap satu pohon dengan React Query.

```tsx
import { LenisProvider } from "@/components/scroll"
```

Lalu ubah isi `Providers` menjadi:

```tsx
        <Providers>
          <LenisProvider>{children}</LenisProvider>
          <Toaster position="top-center" richColors closeButton />
        </Providers>
```

- [ ] **Step 7: Verifikasi build dan lint**

Jalankan: `npm run build`
Diharapkan: selesai tanpa error. Bila muncul error `window is not defined`, berarti ada berkas yang lupa diberi `"use client"`.

Jalankan: `npm run lint`
Diharapkan: bersih.

- [ ] **Step 8: Verifikasi perilaku di browser**

Jalankan `npm run dev`, buka `http://localhost:3000`, lalu scroll.

Diharapkan: scroll terasa halus dengan sedikit inersia, bukan lompat per baris.

Lalu buka DevTools, tekan Ctrl+Shift+P, jalankan `Emulate CSS prefers-reduced-motion: reduce`, dan muat ulang halaman.

Diharapkan: scroll kembali normal tanpa inersia, dan halaman tetap bisa di-scroll sampai footer. Di tab Console, `window.__lenis` harus `undefined`.

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json src/components/scroll src/app/layout.tsx src/app/globals.css
git commit -m "feat(landing): pasang smooth scroll Lenis dan reveal GSAP"
```

---

### Task 4: Tulis ulang HeroSection

Task terbesar. Membuang bingkai HP beserta seluruh isinya, yang merupakan sumber dari empat kategori temuan sekaligus.

**Files:**
- Rewrite: `src/blocks/landing/home/components/hero-section.tsx` (seluruh 203 baris diganti)

**Interfaces:**
- Consumes: `Reveal` dari `@/components/scroll`, `Button` dari `@/components/ui/button`, token dan font dari Task 1 dan 2.
- Produces: `HeroSection()` tanpa prop, diekspor bernama, dipakai `src/blocks/landing/home/index.tsx`.

- [ ] **Step 1: Ganti seluruh isi hero-section.tsx**

```tsx
"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"

const ROTATING_WORDS = ["Pribadi", "Keluarga", "Bisnis", "Masa Depan", "Semua"]

// Angka contoh yang sama dengan mockup lama, kini ditampilkan sebagai
// tipografi berukuran penuh, bukan UI yang disusutkan ke dalam bingkai HP.
const SAMPLE_MONTH = [
  { label: "Pemasukan", amount: 640000, tone: "text-success" },
  { label: "Pengeluaran", amount: -235000, tone: "text-danger" },
  { label: "Sisa", amount: 405000, tone: "text-foreground" },
]

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
    signDisplay: "auto",
  }).format(value)

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0)
  const wordRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = wordRef.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const timer = window.setInterval(() => {
        gsap.to(el, {
          opacity: 0,
          y: -8,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length)
            gsap.fromTo(
              el,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }
            )
          },
        })
      }, 3000)

      return () => window.clearInterval(timer)
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <h1 className="font-serif text-display text-foreground">
              Kelola keuangan
              <br />
              untuk{" "}
              <span ref={wordRef} className="inline-block text-primary">
                {ROTATING_WORDS[wordIndex]}
              </span>
            </h1>

            <p className="max-w-md text-base leading-relaxed text-muted-foreground">
              Catat pengeluaran dan pemasukan dengan mudah. Kelola keuangan untuk masa depan
              yang lebih baik.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 w-full gap-2 rounded-full px-8 text-base font-semibold sm:w-auto"
                >
                  Mulai Sekarang
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 w-full rounded-full px-8 text-base font-semibold sm:w-auto"
                >
                  Masuk
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                Data Terenkripsi
              </span>
              <span>100% Gratis</span>
            </div>
          </div>

          <div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            <p className="text-sm text-muted-foreground">Contoh ringkasan bulan ini</p>
            <dl className="mt-6 flex flex-col">
              {SAMPLE_MONTH.map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between border-b border-border py-4 last:border-b-0"
                >
                  <dt className="text-sm text-muted-foreground">{row.label}</dt>
                  <dd className={`text-2xl font-semibold tabular-nums ${row.tone}`}>
                    {rupiah(row.amount)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Tambahkan pin blok ringkasan, hanya di lg ke atas**

Spec bagian 9 meminta satu momen pin di hero. Tambahkan `ScrollTrigger` di berkas yang sama. Pin hanya aktif mulai `lg` dan saat pengguna tidak meminta reduced motion, karena pin di layar kecil merusak pengalaman scroll.

Tambahkan import berikut di bagian atas berkas:

```tsx
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
```

Tambahkan satu `ref` baru di dalam komponen, di bawah `wordRef`:

```tsx
  const summaryRef = useRef<HTMLDivElement>(null)
```

Tambahkan `useEffect` kedua, di bawah `useEffect` rotasi kata:

```tsx
  useEffect(() => {
    const el = summaryRef.current
    if (!el) return

    const mm = gsap.matchMedia()

    // Pin hanya di layar lebar. Di mobile dan tablet blok ini mengalir
    // normal, karena menahan konten di layar kecil membuat scroll terasa
    // macet.
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 20%",
        end: "+=160",
        pin: true,
        pinSpacing: false,
      })
    })

    return () => mm.revert()
  }, [])
```

Terakhir, pasang `ref={summaryRef}` pada `div` pembungkus blok ringkasan, yaitu `div` dengan kelas `border-t border-border pt-8 lg:border-l ...`.

- [ ] **Step 3: Verifikasi build dan lint**

Jalankan: `npm run build`
Diharapkan: selesai tanpa error.

Jalankan: `npm run lint`
Diharapkan: bersih. Bila muncul `'Wallet' is defined but never used`, berarti masih ada import lama yang tertinggal.

- [ ] **Step 4: Verifikasi tidak ada sisa pelanggaran**

Jalankan: `grep -nE "text-\[[0-9]|gradient|shadow-|order-[12]|truncate" src/blocks/landing/home/components/hero-section.tsx`

Diharapkan: tidak ada hasil sama sekali. Bila ada, berarti ada pola lama yang lolos.

- [ ] **Step 5: Verifikasi visual di 360px dan 1440px**

Jalankan `npm run dev`, buka DevTools, atur lebar viewport ke 360px.

Diharapkan: satu kolom. Urutan dari atas adalah judul, paragraf, dua tombol bertumpuk, baris kepercayaan, lalu blok ringkasan. Judul muncul lebih dulu daripada angka, bukan sebaliknya seperti versi lama. Tidak ada scroll horizontal. Tidak ada teks yang lebih kecil dari 14px. Blok ringkasan **tidak** tertahan saat di-scroll.

Lalu atur ke 1440px dan scroll perlahan melewati hero.

Diharapkan: blok ringkasan tertahan sebentar sekitar 160px lalu ikut mengalir lagi. Kata terakhir di judul berganti tiap 3 detik dengan transisi naik-turun halus.

- [ ] **Step 6: Commit**

```bash
git add src/blocks/landing/home/components/hero-section.tsx
git commit -m "feat(landing): rombak hero jadi dipimpin tipografi tanpa mockup HP"
```

---

### Task 5: Tulis ulang StatsSection

**Files:**
- Rewrite: `src/blocks/landing/home/components/stats-section.tsx` (seluruh 47 baris diganti)

**Interfaces:**
- Consumes: `Reveal` dari `@/components/scroll`.
- Produces: `StatsSection()` tanpa prop.

- [ ] **Step 1: Ganti seluruh isi stats-section.tsx**

Isi data tidak berubah sama sekali, termasuk `24/7`. Yang berubah presentasinya: kartu dan `truncate` dibuang.

```tsx
import { Reveal } from "@/components/scroll"

const stats = [
  { label: "Pencatatan Keuangan", value: "Mudah", description: "Tanpa ribet" },
  { label: "Keamanan", value: "Terenkripsi", description: "Data 100% aman" },
  { label: "Biaya Penggunaan", value: "Gratis", description: "Selamanya" },
  { label: "Akses Aplikasi", value: "24/7", description: "Kapan saja, di mana saja" },
]

export function StatsSection() {
  return (
    <section id="fitur" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <Reveal className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-background p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-2 font-serif text-3xl text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
```

Teknik `gap-px` dengan latar `bg-border` pada wadah dan `bg-background` pada tiap sel menghasilkan garis rambut pemisah tanpa satu pun `border` per sel, jadi tidak ada garis ganda di sudut dan tidak butuh `divide-x` yang harus dibatalkan per breakpoint seperti versi lama.

- [ ] **Step 2: Verifikasi tidak ada truncate tersisa**

Jalankan: `grep -n "truncate\|rounded-2xl\|shadow-" src/blocks/landing/home/components/stats-section.tsx`

Diharapkan: tidak ada hasil.

- [ ] **Step 3: Verifikasi build dan lint**

Jalankan: `npm run build && npm run lint`
Diharapkan: keduanya bersih.

- [ ] **Step 4: Verifikasi visual**

Buka `http://localhost:3000` di lebar 360px, 768px, dan 1440px.

Diharapkan: satu kolom di 360px, dua kolom di 768px, empat kolom di 1440px. Teks "Kapan saja, di mana saja" tampil utuh di semua lebar, tidak terpotong elipsis.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/landing/home/components/stats-section.tsx
git commit -m "feat(landing): ubah stats jadi baris garis rambut tanpa truncate"
```

---

### Task 6: Tulis ulang FeaturesSection

**Files:**
- Rewrite: `src/blocks/landing/home/components/features-section.tsx` (seluruh 101 baris diganti)

**Interfaces:**
- Consumes: `Reveal` dari `@/components/scroll`.
- Produces: `FeaturesSection()` tanpa prop.

- [ ] **Step 1: Ganti seluruh isi features-section.tsx**

Empat kartu identik diganti daftar editorial bernomor. Tautan "Lihat Selengkapnya" yang mengarah ke `href="#"` dibuang seluruhnya, karena tautan yang tidak menuju ke mana pun melanggar `fe-rules.md` baris 12 dan menyesatkan pengguna.

```tsx
import { Reveal } from "@/components/scroll"
import { Wallet, TrendingUp, PieChart, Shield } from "lucide-react"

const features = [
  {
    icon: Wallet,
    title: "Catat Transaksi",
    description:
      "Catat pemasukan dan pengeluaran harian dengan mudah. Tambahkan catatan dan kategori untuk setiap transaksi.",
  },
  {
    icon: TrendingUp,
    title: "Pantau Keuangan",
    description:
      "Lihat ringkasan keuangan dan pahami pola pengeluaran Anda melalui grafik yang informatif.",
  },
  {
    icon: PieChart,
    title: "Kelola Kategori",
    description:
      "Atur kategori pemasukan dan pengeluaran sesuai kebutuhan untuk pencatatan yang lebih rapi dan terorganisir.",
  },
  {
    icon: Shield,
    title: "Aman & Privat",
    description:
      "Data keuangan Anda terenkripsi dengan aman. Hanya Anda yang memiliki akses ke informasi finansial pribadi.",
  },
]

export function FeaturesSection() {
  return (
    <section id="tentang" className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="font-serif text-h2 text-foreground">
            Beragam fitur berkualitas untuk kelola keuangan
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Aplikasi pencatatan keuangan sederhana dengan fitur lengkap yang membantu Anda
            mengelola uang dengan lebih baik.
          </p>
        </Reveal>

        <Reveal className="mt-12 grid md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <article
                key={feature.title}
                className="border-t border-border py-8 md:px-8 md:first:pl-0 md:[&:nth-child(2)]:pr-0"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-serif text-2xl tabular-nums text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </article>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verifikasi tidak ada tautan mati tersisa**

Jalankan: `grep -n 'href="#"' src/blocks/landing/home/components/features-section.tsx`

Diharapkan: tidak ada hasil.

- [ ] **Step 3: Verifikasi build dan lint**

Jalankan: `npm run build && npm run lint`
Diharapkan: keduanya bersih. Bila lint mengeluh `'Link' is defined but never used` atau `'ArrowRight' is defined but never used`, berarti import lama belum terhapus.

- [ ] **Step 4: Verifikasi visual**

Diharapkan: satu kolom di 360px, dua kolom mulai 768px. Nomor 01 sampai 04 rata lebar karena `tabular-nums`. Tidak ada kartu dengan bayangan.

- [ ] **Step 5: Commit**

```bash
git add src/blocks/landing/home/components/features-section.tsx
git commit -m "feat(landing): ubah fitur jadi daftar editorial dan hapus tautan mati"
```

---

### Task 7: Pisahkan dan tulis ulang SavingsSimulator

Task ini memperbaiki cacat fungsional, bukan hanya tampilan. Tombol "Hitung Simulasi" di versi lama tidak melakukan apa pun karena perhitungan diturunkan langsung dari state pada tiap render.

**Files:**
- Create: `src/blocks/landing/home/components/savings-simulator.tsx`
- Modify: `src/blocks/landing/home/components/index.ts` (tambah export)
- Modify: `src/blocks/landing/home/index.tsx` (sisipkan section)

**Interfaces:**
- Consumes: `Reveal` dari `@/components/scroll`, `Button` dari `@/components/ui/button`.
- Produces: `SavingsSimulator()` tanpa prop, diekspor bernama dari barrel `@/blocks/landing/home/components`.

- [ ] **Step 1: Buat savings-simulator.tsx**

```tsx
"use client"

import { useState } from "react"
import { Reveal } from "@/components/scroll"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"

const MIN_TARGET = 10000
const MIN_MONTHLY = 10000

type Result = {
  months: number
  total: number
  monthly: number
}

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)

const digitsOnly = (value: string) => value.replace(/\D/g, "")

const describeDuration = (months: number) => {
  const years = Math.floor(months / 12)
  const rest = months % 12
  if (years === 0) return `${rest} bulan`
  if (rest === 0) return `${years} tahun`
  return `${years} tahun ${rest} bulan`
}

export function SavingsSimulator() {
  const [target, setTarget] = useState("10000000")
  const [monthly, setMonthly] = useState("1000000")
  const [errors, setErrors] = useState<{ target?: string; monthly?: string }>({})
  const [result, setResult] = useState<Result | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const targetNum = Number(target)
    const monthlyNum = Number(monthly)
    const nextErrors: { target?: string; monthly?: string } = {}

    if (!targetNum || targetNum < MIN_TARGET) {
      nextErrors.target = `Target tabungan minimal ${rupiah(MIN_TARGET)}.`
    }
    if (!monthlyNum || monthlyNum < MIN_MONTHLY) {
      nextErrors.monthly = `Tabungan bulanan minimal ${rupiah(MIN_MONTHLY)}.`
    }
    if (!nextErrors.monthly && monthlyNum > targetNum) {
      nextErrors.monthly = "Tabungan bulanan tidak boleh melebihi target."
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setResult(null)
      return
    }

    setIsCalculating(true)
    setResult({
      months: Math.ceil(targetNum / monthlyNum),
      total: targetNum,
      monthly: monthlyNum,
    })
    setIsCalculating(false)
  }

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <Reveal className="max-w-2xl">
          <h2 className="font-serif text-h2 text-foreground">
            Yuk coba simulasikan tabungan kamu
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            SIKAS membantu kamu merencanakan dan mencapai tujuan keuanganmu dengan lebih
            mudah.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="target" className="text-sm font-medium text-foreground">
                Target Tabungan
              </label>
              <input
                id="target"
                name="target"
                type="text"
                inputMode="numeric"
                value={rupiah(Number(target) || 0)}
                onChange={(event) => setTarget(digitsOnly(event.target.value))}
                aria-invalid={Boolean(errors.target)}
                aria-describedby={errors.target ? "target-error" : undefined}
                className="h-12 rounded-lg border border-border bg-input px-4 text-base tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring-focus"
              />
              {errors.target ? (
                <p id="target-error" role="alert" className="text-sm text-danger">
                  {errors.target}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="monthly" className="text-sm font-medium text-foreground">
                Tabungan Bulanan
              </label>
              <input
                id="monthly"
                name="monthly"
                type="text"
                inputMode="numeric"
                value={rupiah(Number(monthly) || 0)}
                onChange={(event) => setMonthly(digitsOnly(event.target.value))}
                aria-invalid={Boolean(errors.monthly)}
                aria-describedby={errors.monthly ? "monthly-error" : undefined}
                className="h-12 rounded-lg border border-border bg-input px-4 text-base tabular-nums text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring-focus"
              />
              {errors.monthly ? (
                <p id="monthly-error" role="alert" className="text-sm text-danger">
                  {errors.monthly}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isCalculating}
              className="h-12 rounded-lg text-base font-semibold"
            >
              {isCalculating ? "Menghitung" : "Hitung Simulasi"}
            </Button>
          </form>

          <div className="border-t border-border pt-8 lg:border-l lg:border-t-0 lg:pl-16 lg:pt-0">
            <p className="text-sm text-muted-foreground">Hasil simulasi</p>

            {result ? (
              <div aria-live="polite">
                <p className="mt-2 font-serif text-h2 text-primary">
                  {describeDuration(result.months)}
                </p>
                <dl className="mt-8 flex flex-col">
                  <div className="flex items-baseline justify-between border-b border-border py-4">
                    <dt className="text-sm text-muted-foreground">Total tabungan</dt>
                    <dd className="text-lg font-semibold tabular-nums text-foreground">
                      {rupiah(result.total)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between border-b border-border py-4">
                    <dt className="text-sm text-muted-foreground">Per bulan</dt>
                    <dd className="text-lg font-semibold tabular-nums text-foreground">
                      {rupiah(result.monthly)}
                    </dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="mt-2 text-base text-muted-foreground">
                Isi target dan tabungan bulanan, lalu tekan Hitung Simulasi untuk melihat
                perkiraan waktunya.
              </p>
            )}

            <p className="mt-8 flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Simulasi ini hanya perkiraan dan dapat berbeda dengan hasil sebenarnya
              tergantung konsistensi menabung.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
```

Progress bar bergradasi dari versi lama dibuang seluruhnya. Bar itu selalu menampilkan 100% pada state apa pun, jadi tidak menyampaikan informasi dan hanya memicu flag `ai color palette`.

- [ ] **Step 2: Tambahkan export di barrel**

Tambahkan satu baris di `src/blocks/landing/home/components/index.ts`, sejajar dengan export lain:

```ts
export { SavingsSimulator } from "./savings-simulator"
```

- [ ] **Step 3: Sisipkan di halaman**

Ubah `src/blocks/landing/home/index.tsx` menjadi:

```tsx
import {
  LandingNav,
  HeroSection,
  StatsSection,
  FeaturesSection,
  SavingsSimulator,
  CtaSection,
  Footer,
} from "@/blocks/landing/home/components"
import { Chatbot } from "@/components/chatbot"

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <SavingsSimulator />
        <CtaSection />
      </main>
      <Footer />
      <Chatbot />
    </div>
  )
}
```

- [ ] **Step 4: Verifikasi build dan lint**

Jalankan: `npm run build && npm run lint`
Diharapkan: keduanya bersih.

- [ ] **Step 5: Verifikasi kelima state secara manual**

Buka `http://localhost:3000` dan gulir ke simulator. Uji satu per satu:

| Aksi | Hasil yang diharapkan |
| --- | --- |
| Muat halaman, jangan sentuh apa pun | Panel kanan menampilkan kalimat ajakan, bukan angka. Ini membuktikan hasil tidak lagi muncul sebelum tombol ditekan. |
| Kosongkan Target, tekan Hitung Simulasi | Muncul "Target tabungan minimal Rp 10.000" di bawah input Target, hasil tetap kosong |
| Isi Target 5.000, tekan Hitung Simulasi | Muncul pesan minimal yang sama |
| Target 1.000.000 dan Bulanan 5.000.000, tekan Hitung | Muncul "Tabungan bulanan tidak boleh melebihi target." |
| Target 10.000.000 dan Bulanan 1.000.000, tekan Hitung | Muncul "10 bulan", Total tabungan Rp 10.000.000, Per bulan Rp 1.000.000 |

- [ ] **Step 6: Commit**

```bash
git add src/blocks/landing/home/components/savings-simulator.tsx src/blocks/landing/home/components/index.ts src/blocks/landing/home/index.tsx
git commit -m "feat(landing): pisahkan simulator tabungan dan buat tombolnya berfungsi"
```

---

### Task 8: Rampingkan CtaSection

**Files:**
- Rewrite: `src/blocks/landing/home/components/cta-section.tsx` (dari 194 baris menjadi sekitar 25)

**Interfaces:**
- Consumes: `Reveal`, `Button`.
- Produces: `CtaSection()` tanpa prop.

- [ ] **Step 1: Ganti seluruh isi cta-section.tsx**

Seluruh simulator sudah pindah ke Task 7. Yang tersisa hanya ajakan mendaftar. Rotasi kata `ROTATING_GOALS` dibuang karena rotasi kata sudah dipakai di hero, dan mengulanginya di section kedua membuat halaman terasa berpola.

```tsx
import Link from "next/link"
import { Reveal } from "@/components/scroll"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24 lg:py-32">
        <Reveal className="flex max-w-2xl flex-col items-start gap-6">
          <h2 className="font-serif text-h2 text-foreground">
            Siap untuk mulai mencatat dan merencanakan keuanganmu?
          </h2>
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-8 text-base font-semibold"
            >
              Daftar Gratis Sekarang
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verifikasi tidak ada sisa simulator**

Jalankan: `grep -nE "ROTATING_GOALS|targetAmount|monthlyAmount|bg-linear-to" src/blocks/landing/home/components/cta-section.tsx`

Diharapkan: tidak ada hasil.

- [ ] **Step 3: Verifikasi build dan lint**

Jalankan: `npm run build && npm run lint`
Diharapkan: keduanya bersih.

- [ ] **Step 4: Commit**

```bash
git add src/blocks/landing/home/components/cta-section.tsx
git commit -m "refactor(landing): rampingkan CTA jadi satu ajakan mendaftar"
```

---

### Task 9: Rapikan nav dan footer

**Files:**
- Modify: `src/blocks/landing/home/components/landing-nav.tsx`
- Modify: `src/blocks/landing/home/components/landing-nav-mobile.tsx`
- Modify: `src/blocks/landing/home/components/landing-nav-desktop.tsx`
- Modify: `src/blocks/landing/home/components/footer.tsx`

**Interfaces:**
- Consumes: `stopPageScroll` dan `startPageScroll` dari `@/components/scroll`.
- Produces: tidak ada antarmuka baru.

- [ ] **Step 1: Kunci scroll dan tutup dengan Escape di landing-nav.tsx**

Menu mobile saat ini adalah overlay `fixed` tanpa penguncian scroll sama sekali, jadi halaman di belakangnya tetap bergeser. Menu juga tidak bisa ditutup dengan Escape.

Ubah baris 3 menjadi:

```tsx
import { useEffect, useState } from "react"
```

Tambahkan import di bawah import komponen nav:

```tsx
import { startPageScroll, stopPageScroll } from "@/components/scroll"
```

Tambahkan `useEffect` tepat di bawah deklarasi `isMobileMenuOpen`:

```tsx
  useEffect(() => {
    if (!isMobileMenuOpen) return

    stopPageScroll()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      startPageScroll()
    }
  }, [isMobileMenuOpen])
```

Ubah baris 37 dan 38 menjadi:

```tsx
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
```

Tambahkan `aria-expanded` pada tombol menu di baris 52, supaya pembaca layar tahu statusnya:

```tsx
            aria-expanded={isMobileMenuOpen}
```

- [ ] **Step 2: Naikkan ukuran teks dan buang bayangan di landing-nav-desktop.tsx**

Ganti seluruh `text-[15px]` menjadi `text-sm`. Ada enam kemunculan, di baris 55, 87, 103, 109, 115, dan 122.

Ganti baris 74 untuk membuang `shadow-xl`, karena landing page tidak memakai bayangan sama sekali:

```tsx
          <div className="min-w-100 rounded-lg border border-border bg-card p-4">
```

Ganti `rounded-xl` pada tautan dropdown di baris 80 dan wadah ikon di baris 83 menjadi `rounded-lg`, mengikuti aturan radius dua nilai.

- [ ] **Step 3: Naikkan ukuran teks di landing-nav-mobile.tsx**

Baris 76 memakai `text-xs` yang setara 12px dan melanggar lantai 14px. Ganti menjadi:

```tsx
                    <p className="text-sm text-muted-foreground">
```

Ganti `rounded-xl` di baris 66 dan `rounded-lg` di baris 69 agar keduanya `rounded-lg`.

Tautan menu di baris 88, 95, dan 102 sudah memakai `py-3` sehingga tinggi sentuhnya 44px atau lebih. Biarkan.

- [ ] **Step 4: Perbaiki tujuh tautan mati di footer.tsx**

Ini bukan perubahan gaya, ini perbaikan cacat. Footer punya tujuh `href="#"` yang tidak menuju ke mana pun, padahal sebagian halamannya sudah ada.

Baris 25 sampai 31, alamat kantor bukan tautan. Ganti seluruh elemen `<a>` menjadi `<div>` dan hapus `href` serta kelas `hover:text-primary`:

```tsx
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <span>Surabaya, Indonesia</span>
              </div>
```

Baris 59, 62, dan 65, tiga tautan fitur diarahkan ke section fitur yang memang ada di halaman:

```tsx
              <Link href="#fitur" className="py-2 hover:text-primary transition-colors">
                Kelola Saldo
              </Link>
              <Link href="#fitur" className="py-2 hover:text-primary transition-colors">
                Catat Transaksi
              </Link>
              <Link href="#fitur" className="py-2 hover:text-primary transition-colors">
                Laporan Keuangan
              </Link>
```

Baris 74, FAQ diarahkan ke halaman `/faq` yang sudah ada di `src/app/faq/`:

```tsx
              <Link href="/faq" className="py-2 hover:text-primary transition-colors">
                FAQ
              </Link>
```

Baris 77 sampai 82, Kebijakan Privasi dan Syarat dan Ketentuan **dihapus seluruhnya**. Tidak ada halaman untuk keduanya di `src/app/`, dan tautan yang tidak menuju ke mana pun lebih buruk daripada tidak ada tautan. Bila kedua halaman itu nanti dibuat, tautannya dikembalikan.

Tambahkan `py-2` pada seluruh tautan footer lain di baris 46, 49, 52, 87, dan 90 agar tinggi sentuhnya mencapai 44px.

- [ ] **Step 5: Samakan wadah dan heading footer**

Ganti baris 8:

```tsx
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
```

Ganti seluruh `<h5 className="font-semibold text-foreground ...">` menjadi `font-serif text-lg text-foreground`. Ada tujuh kemunculan, di baris 22, 44, 57, 72, 85, 97, dan 102. Contoh untuk baris 44:

```tsx
            <h5 className="mb-4 font-serif text-lg text-foreground">Navigasi</h5>
```

- [ ] **Step 6: Verifikasi tidak ada pelanggaran tersisa di seluruh landing**

Jalankan: `grep -rnE 'text-\[|text-xs|shadow-|href="#"' src/blocks/landing/home/components/`

Diharapkan: tidak ada hasil sama sekali. Ini gate terakhir untuk kategori `tiny body text` dan untuk tautan mati.

Catatan: `max-w-300`, `min-w-100`, dan `max-h-125` bukan nilai arbitrer. Di Tailwind v4 ketiganya sah dan setara 75rem, 25rem, dan 31,25rem. Yang diganti hanya `max-w-300` di nav dan footer, semata agar lebarnya sama persis dengan `max-w-6xl` yang dipakai section lain.

- [ ] **Step 7: Verifikasi build dan lint**

Jalankan: `npm run build && npm run lint`
Diharapkan: keduanya bersih.

- [ ] **Step 8: Verifikasi kunci scroll dan Escape**

Di lebar 360px, buka menu. Coba scroll halaman di belakang overlay.

Diharapkan: halaman di belakang tidak bergerak. Tekan Escape, menu tertutup. Setelah tertutup, scroll kembali normal dan tetap halus.

- [ ] **Step 9: Commit**

```bash
git add src/blocks/landing/home/components/landing-nav.tsx src/blocks/landing/home/components/landing-nav-mobile.tsx src/blocks/landing/home/components/landing-nav-desktop.tsx src/blocks/landing/home/components/footer.tsx
git commit -m "feat(landing): samakan nav dan footer dengan sistem baru"
```

---

### Task 10: Verifikasi menyeluruh

Task ini tidak mengubah kode kecuali ada temuan. Tujuannya membuktikan hasilnya, bukan mengklaimnya.

**Files:**
- Modify: hanya bila ada temuan.
- Create: `docs/superpowers/plans/2026-08-04-landing-page-redesign-hasil.md`

**Interfaces:**
- Consumes: seluruh Task 1 sampai 9.
- Produces: catatan hasil verifikasi.

- [ ] **Step 1: Jalankan seluruh gate otomatis**

```bash
npm run check:contrast
npm run lint
npm run build
```

Diharapkan: ketiganya keluar dengan kode 0. Bila ada yang gagal, perbaiki dulu dan jangan lanjut.

- [ ] **Step 2: Uji tiga lebar viewport**

Buka `http://localhost:3000` pada 360px, 768px, dan 1440px.

Diharapkan: tidak ada scroll horizontal di 360px. Periksa dengan menjalankan di Console: `document.documentElement.scrollWidth <= window.innerWidth` yang harus mengembalikan `true`.

- [ ] **Step 3: Uji reduced motion**

Di DevTools jalankan `Emulate CSS prefers-reduced-motion: reduce`, lalu muat ulang.

Diharapkan: `window.__lenis` bernilai `undefined` di Console, seluruh isi halaman langsung terlihat tanpa animasi masuk, dan halaman tetap bisa di-scroll sampai footer.

- [ ] **Step 4: Uji navigasi keyboard**

Tekan Tab dari atas halaman sampai footer.

Diharapkan: cincin fokus terlihat jelas di setiap tautan dan tombol, urutannya mengikuti urutan visual, menu mobile bisa ditutup dengan Escape, dan tidak ada elemen yang terlewat atau terjebak.

- [ ] **Step 5: Jalankan ulang Impeccable**

Buka landing page, klik Scan page di ekstensi Impeccable.

Diharapkan: nol anti-pattern. Bila masih ada, catat setiap sisanya beserta elemen dan alasannya di berkas hasil pada langkah berikutnya. Jangan menulis bahwa pekerjaan selesai selama masih ada temuan yang belum dijelaskan.

- [ ] **Step 6: Tulis catatan hasil**

Buat `docs/superpowers/plans/2026-08-04-landing-page-redesign-hasil.md` berisi keluaran asli `npm run check:contrast`, jumlah temuan Impeccable sebelum dan sesudah, dan daftar temuan yang masih tersisa bila ada beserta alasannya.

- [ ] **Step 7: Commit dan buka PR**

```bash
git add docs/superpowers/plans/2026-08-04-landing-page-redesign-hasil.md
git commit -m "docs(landing): catat hasil verifikasi redesign"
git push origin feat/landing-page-redesign
```

Buka PR dengan base `main`, memakai template deskripsi di `docs/git-workflow.md` baris 57. Pada bagian Cara test, salin langkah nyata dari Task 10 ini, bukan langkah yang belum dijalankan.

---

## Catatan untuk pelaksana

**Dashboard ikut berubah warnanya.** Task 1 mengubah token global, jadi tombol dan teks di dashboard, login, dan form ikut menjadi lebih pekat. Itu disengaja dan sudah disetujui. Perombakan layout dashboard bukan bagian dari rencana ini. Bila menemukan sesuatu yang rusak parah di dashboard, catat, jangan perbaiki di sini.

**Dua gradasi kartu saldo di dashboard belum disentuh.** Token `--gradient-mbanking-*` dan `--gradient-cash-*` sengaja dibiarkan karena masih dipakai di luar landing page.

**Urutan task tidak boleh ditukar.** Task 4 sampai 9 semuanya bergantung pada token dari Task 1, font dari Task 2, dan `Reveal` dari Task 3.
