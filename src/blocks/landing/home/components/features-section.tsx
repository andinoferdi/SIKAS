import Link from "next/link"
import { Wallet, TrendingUp, PieChart, Shield, ArrowRight } from "lucide-react"

const features = [
  {
    icon: Wallet,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    title: "Catat Transaksi",
    description:
      "Catat pemasukan dan pengeluaran harian dengan mudah. Tambahkan catatan dan kategori untuk setiap transaksi.",
    link: "#",
  },
  {
    icon: TrendingUp,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    title: "Pantau Keuangan",
    description:
      "Lihat ringkasan keuangan dan pahami pola pengeluaran Anda melalui grafik yang informatif.",
    link: "#",
  },
  {
    icon: PieChart,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    title: "Kelola Kategori",
    description:
      "Atur kategori pemasukan dan pengeluaran sesuai kebutuhan untuk pencatatan yang lebih rapi dan terorganisir.",
    link: "#",
  },
  {
    icon: Shield,
    iconBg: "bg-info/10",
    iconColor: "text-info",
    title: "Aman & Privat",
    description:
      "Data keuangan Anda terenkripsi dengan aman. Hanya Anda yang memiliki akses ke informasi finansial pribadi.",
    link: "#",
  },
]

export function FeaturesSection() {
  return (
    <section id="tentang" className="bg-card py-16 lg:py-24">
      <div className="max-w-300 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Beragam Fitur{" "}
            <span className="relative inline-block">
              <span
                className="text-primary"
                style={{
                  borderBottom: "4px solid var(--primary)",
                  paddingBottom: "4px",
                }}
              >
                Berkualitas
              </span>
            </span>{" "}
            untuk Kelola Keuangan
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Aplikasi pencatatan keuangan sederhana dengan fitur lengkap yang membantu Anda mengelola uang dengan lebih baik
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group flex flex-col"
              >
                <div
                  className={`w-14 h-14 rounded-full ${feature.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 grow">
                  {feature.description}
                </p>
                <Link
                  href={feature.link}
                  className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all group/link"
                >
                  Lihat Selengkapnya
                  <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
