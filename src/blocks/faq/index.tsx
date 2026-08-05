"use client"

import { useState } from "react"
import { Search, ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "Apa itu SIKAS?",
    answer: "SIKAS (Sistem Informasi Keuangan Sederhana) adalah aplikasi pencatatan keuangan pribadi yang membantu Anda melacak pemasukan dan pengeluaran dengan mudah. SIKAS dilengkapi dengan fitur AI Chatbot yang bisa membantu menjawab pertanyaan seputar keuangan Anda.",
    category: "Umum",
  },
  {
    id: "2",
    question: "Apakah data keuangan saya aman?",
    answer: "Ya, data Anda disimpan secara lokal di browser (untuk versi demo) dan kami memprioritaskan privasi pengguna. Kami tidak membagikan data pribadi Anda kepada pihak ketiga.",
    category: "Umum",
  },
  {
    id: "3",
    question: "Apa bedanya M-Banking dan Cash?",
    answer: "M-Banking mencatat transaksi yang dilakukan melalui transfer bank atau dompet digital, sedangkan Cash mencatat transaksi menggunakan uang tunai. Pemisahan ini membantu Anda melacak sumber dana dengan lebih akurat.",
    category: "Transaksi",
  },
  {
    id: "4",
    question: "Bagaimana cara menggunakan fitur AI Chatbot?",
    answer: "Klik ikon robot di pojok kanan bawah atau tombol 'Tanya AI' di dashboard. Anda bisa bertanya tentang tips keuangan, atau bahkan mengupload gambar struk/barang untuk dianalisis oleh AI.",
    category: "Fitur",
  },
  {
    id: "5",
    question: "Apakah saya bisa mengedit transaksi yang sudah disimpan?",
    answer: "Tentu! Masuk ke menu Riwayat Transaksi, cari transaksi yang ingin diubah, lalu klik ikon pensil (edit) untuk mengubah detail transaksi tersebut.",
    category: "Transaksi",
  },
]

export default function FAQList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory ? faq.category === selectedCategory : true
    const matchesSearch = searchQuery
      ? faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  const categories = Array.from(new Set(FAQ_DATA.map(item => item.category)))

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "p-3 rounded-xl text-sm font-medium transition-all text-center border cursor-pointer",
              selectedCategory === cat
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border-transparent hover:border-primary/20"
            )}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "p-3 rounded-xl text-sm font-medium transition-all text-center border cursor-pointer",
            selectedCategory === null
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
              : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border-transparent hover:border-primary/20"
          )}
        >
          Semua
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          placeholder="Cari pertanyaan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
      </div>

      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>Tidak ditemukan pertanyaan yang cocok.</p>
          </div>
        ) : (
          filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                    {faq.category}
                  </span>
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    {faq.question}
                  </span>
                </div>
                {openId === faq.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                )}
              </button>
              
              <div
                className={cn(
                  "px-4 text-muted-foreground text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
                  openId === faq.id ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <p>{faq.answer}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
