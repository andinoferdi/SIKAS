const stats = [
  {
    label: "Pencatatan Keuangan",
    value: "Mudah",
    description: "Tanpa ribet",
  },
  {
    label: "Keamanan",
    value: "Terenkripsi",
    description: "Data 100% aman",
  },
  {
    label: "Biaya Penggunaan",
    value: "Gratis",
    description: "Selamanya",
  },
  {
    label: "Akses Aplikasi",
    value: "24/7",
    description: "Kapan saja, di mana saja",
  },
]

export function StatsSection() {
  return (
    <section id="fitur" className="bg-card py-8 lg:py-12">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-x-0 sm:divide-x divide-y sm:divide-y-0 lg:divide-y-0 divide-border/50">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-5 sm:p-6 lg:p-8 text-center hover:bg-muted/30 transition-colors"
              >
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 truncate">{stat.label}</p>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-1 truncate">
                  {stat.value}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
