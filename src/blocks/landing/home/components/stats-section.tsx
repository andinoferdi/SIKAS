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
