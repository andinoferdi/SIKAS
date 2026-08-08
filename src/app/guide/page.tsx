import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import GuideList from "@/blocks/guide"

export const metadata: Metadata = {
  title: "Panduan Pengguna - SIKAS",
  description: "Pelajari cara menggunakan SIKAS untuk mengelola keuangan Anda dengan lebih baik.",
}

export default function GuidePage() {
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

        <div className="mt-8 max-w-2xl md:mt-12">
          <h1 className="text-h2 font-bold tracking-tight text-foreground">Panduan SIKAS</h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Empat panduan singkat untuk menguasai pencatatan keuangan di SIKAS, dari mendaftar
            sampai memanfaatkan asisten AI.
          </p>
        </div>

        <div className="mt-10 md:mt-12">
          <GuideList />
        </div>

        <p className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground">
          Masih ada yang ingin ditanyakan?{" "}
          <Link href="/faq" className="font-medium text-primary hover:underline">
            Lihat pusat bantuan
          </Link>
        </p>
      </div>
    </main>
  )
}
