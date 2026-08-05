import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import FAQList from "@/blocks/faq"

export const metadata: Metadata = {
  title: "Pusat Bantuan - SIKAS",
  description: "Temukan jawaban untuk pertanyaan umum seputar penggunaan aplikasi SIKAS.",
}

export default function FAQPage() {
  return (
    <main className="min-h-dvh bg-background pb-20 lg:pb-0">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Kembali ke beranda
        </Link>

        <div className="mt-8 max-w-2xl border-b border-border pb-10 md:mt-12 md:pb-12">
          <h1 className="text-h2 font-bold tracking-tight text-foreground">Pusat Bantuan</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Jawaban untuk pertanyaan yang paling sering muncul. Kalau belum terjawab, tanyakan
            langsung ke asisten AI di dalam aplikasi.
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <FAQList />
        </div>

        <p className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">
          Butuh langkah yang lebih rinci?{" "}
          <Link href="/guide" className="font-medium text-primary hover:underline">
            Buka panduan lengkap
          </Link>
        </p>
      </div>
    </main>
  )
}
