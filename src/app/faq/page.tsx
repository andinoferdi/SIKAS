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
    <main className="min-h-screen bg-background pb-20 lg:pb-0">
      <div className="bg-primary pt-12 pb-20 px-6 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-foreground/15 via-transparent to-transparent opacity-80"></div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">Pusat Bantuan</h1>
          <p className="text-primary-foreground/80 text-sm sm:text-base leading-relaxed">
            Punya pertanyaan? Temukan jawabannya di sini atau tanyakan langsung pada AI Bot kami.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-card rounded-2xl p-6 shadow-xl border border-border/50">
          <FAQList />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            Masih butuh bantuan? <Link href="/guide" className="text-primary font-medium hover:underline">Lihat Panduan Lengkap</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
