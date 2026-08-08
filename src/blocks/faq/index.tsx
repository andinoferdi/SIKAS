"use client"

import { useId, useState } from "react"
import { Search } from "lucide-react"

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
    answer:
      "SIKAS (Sistem Informasi Keuangan Sederhana) adalah aplikasi pencatatan keuangan pribadi yang membantu Anda melacak pemasukan dan pengeluaran dengan mudah. SIKAS dilengkapi dengan fitur AI Chatbot yang bisa membantu menjawab pertanyaan seputar keuangan Anda.",
    category: "Umum",
  },
  {
    id: "2",
    question: "Apakah data keuangan saya aman?",
    answer:
      "Ya, data Anda disimpan secara lokal di browser (untuk versi demo) dan kami memprioritaskan privasi pengguna. Kami tidak membagikan data pribadi Anda kepada pihak ketiga.",
    category: "Umum",
  },
  {
    id: "3",
    question: "Apa bedanya M-Banking dan Cash?",
    answer:
      "M-Banking mencatat transaksi yang dilakukan melalui transfer bank atau dompet digital, sedangkan Cash mencatat transaksi menggunakan uang tunai. Pemisahan ini membantu Anda melacak sumber dana dengan lebih akurat.",
    category: "Transaksi",
  },
  {
    id: "4",
    question: "Bagaimana cara menggunakan fitur AI Chatbot?",
    answer:
      "Klik ikon robot di pojok kanan bawah atau tombol 'Tanya AI' di dashboard. Anda bisa bertanya tentang tips keuangan, atau bahkan mengupload gambar struk/barang untuk dianalisis oleh AI.",
    category: "Fitur",
  },
  {
    id: "5",
    question: "Apakah saya bisa mengedit transaksi yang sudah disimpan?",
    answer:
      "Tentu! Masuk ke menu Riwayat Transaksi, cari transaksi yang ingin diubah, lalu klik ikon pensil (edit) untuk mengubah detail transaksi tersebut.",
    category: "Transaksi",
  },
]

const CATEGORIES = Array.from(new Set(FAQ_DATA.map((item) => item.category)))

export default function FAQList() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const baseId = useId()

  const term = query.trim().toLowerCase()
  const results = FAQ_DATA.filter((faq) => {
    const byCategory = category ? faq.category === category : true
    const bySearch = term
      ? faq.question.toLowerCase().includes(term) || faq.answer.toLowerCase().includes(term)
      : true
    return byCategory && bySearch
  })

  const filters: { label: string; value: string | null }[] = [
    { label: "Semua", value: null },
    ...CATEGORIES.map((c) => ({ label: c, value: c })),
  ]

  return (
    <div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari pertanyaan"
          aria-label="Cari pertanyaan"
          className="h-12 w-full rounded-lg border border-border bg-input pl-12 pr-4 text-base text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring-focus"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2" role="group" aria-label="Saring kategori">
        {filters.map((filter) => {
          const active = category === filter.value
          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setCategory(filter.value)}
              aria-pressed={active}
              className={`border-b-2 py-2 text-sm transition-colors ${
                active
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        {results.length} dari {FAQ_DATA.length} pertanyaan
      </p>

      {results.length === 0 ? (
        <div className="mt-8 border-t border-border py-12">
          <p className="text-base text-foreground">Tidak ada pertanyaan yang cocok.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Coba kata kunci lain, atau pilih kategori Semua untuk melihat seluruh pertanyaan.
          </p>
        </div>
      ) : (
        <dl className="mt-8">
          {results.map((faq) => {
            const isOpen = openId === faq.id
            const panelId = `${baseId}-panel-${faq.id}`
            const buttonId = `${baseId}-button-${faq.id}`
            return (
              <div key={faq.id} className="border-t border-border last:border-b">
                <dt>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="flex w-full items-start justify-between gap-6 py-5 text-left"
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-sm text-muted-foreground">{faq.category}</span>
                      <span className="text-base font-medium text-foreground">
                        {faq.question}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-2xl font-light leading-none text-muted-foreground"
                    >
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                </dt>
                {isOpen ? (
                  <dd
                    id={panelId}
                    aria-labelledby={buttonId}
                    className="max-w-2xl pb-6 text-base leading-relaxed text-muted-foreground"
                  >
                    {faq.answer}
                  </dd>
                ) : null}
              </div>
            )
          })}
        </dl>
      )}
    </div>
  )
}
