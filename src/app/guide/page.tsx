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
    <main className="min-h-screen bg-background pb-20 lg:pb-0">
      <div className="bg-primary/5 pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Panduan SIKAS</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Kumpulan artikel dan tutorial untuk membantu Anda menguasai manajemen keuangan pribadi menggunakan SIKAS.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Topik Populer</h2>
          <Link href="/faq" className="text-sm text-primary hover:underline font-medium">
            Lihat FAQ
          </Link>
        </div>
        
        <GuideList />
      </div>
    </main>
  )
}
