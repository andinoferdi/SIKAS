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
