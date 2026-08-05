import { BookOpen, Wallet, Calculator, Lightbulb } from "lucide-react"

/*
  Setiap panduan ditampilkan utuh di halaman ini, bukan sebagai kartu yang
  menautkan ke halaman detail. Alasannya: halaman detailnya belum ada, dan
  versi lama menautkan keempatnya ke href="#" yang tidak menuju ke mana pun.
*/
const GUIDES = [
  {
    id: "getting-started",
    icon: BookOpen,
    title: "Memulai SIKAS",
    summary: "Untuk pengguna baru yang belum pernah memakai aplikasi pencatatan keuangan.",
    steps: [
      "Daftar dengan nama dan PIN 4 sampai 6 digit. Tidak perlu email.",
      "Masuk ke dashboard untuk melihat ringkasan saldo M-Banking dan Cash.",
      "Catat transaksi pertama lewat tombol tambah di halaman transaksi.",
    ],
  },
  {
    id: "managing-transactions",
    icon: Wallet,
    title: "Manajemen Transaksi",
    summary: "Mencatat, mengubah, dan menelusuri pemasukan serta pengeluaran.",
    steps: [
      "Pilih jenis transaksi, pemasukan atau pengeluaran, lalu isi nominalnya.",
      "Tentukan sumber dana M-Banking atau Cash supaya saldo terpisah rapi.",
      "Buka Riwayat Transaksi lalu klik ikon pensil untuk mengubah data lama.",
    ],
  },
  {
    id: "budgeting-101",
    icon: Calculator,
    title: "Dasar Penganggaran",
    summary: "Metode 50/30/20 untuk membagi gaji bulanan agar tidak habis di tengah bulan.",
    steps: [
      "Sisihkan 50 persen penghasilan untuk kebutuhan pokok.",
      "Alokasikan 30 persen untuk keinginan dan hiburan.",
      "Simpan 20 persen sisanya sebagai tabungan atau dana darurat.",
    ],
  },
  {
    id: "ai-features",
    icon: Lightbulb,
    title: "Memaksimalkan Fitur AI",
    summary: "Asisten AI membantu menjawab pertanyaan dan membaca pola pengeluaran.",
    steps: [
      "Buka chatbot lewat ikon di pojok kanan bawah layar.",
      "Tanyakan hal spesifik, misalnya pengeluaran terbesar bulan ini.",
      "Minta saran penghematan berdasarkan catatan transaksi yang sudah ada.",
    ],
  },
]

export default function GuideList() {
  return (
    <div>
      {GUIDES.map((guide, index) => {
        const Icon = guide.icon
        return (
          <article key={guide.id} className="border-t border-border py-10 last:border-b">
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:gap-10">
              <span className="text-2xl font-bold tabular-nums text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="max-w-2xl">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-foreground">
                  <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  {guide.title}
                </h3>

                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {guide.summary}
                </p>

                <ol className="mt-6 flex list-decimal flex-col gap-3 pl-5 marker:text-muted-foreground">
                  {guide.steps.map((step) => (
                    <li key={step} className="text-base leading-relaxed text-foreground">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
