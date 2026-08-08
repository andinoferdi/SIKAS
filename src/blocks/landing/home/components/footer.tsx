import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin } from "lucide-react"

const NAVIGASI = [
  { href: "/", label: "Beranda" },
  { href: "#fitur", label: "Fitur" },
  { href: "#tentang", label: "Tentang" },
  { href: "/guide", label: "Panduan" },
  { href: "/faq", label: "FAQ" },
]

const AKUN = [
  { href: "/login", label: "Masuk" },
  { href: "/register", label: "Daftar" },
]

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/logo.png"
                alt="SIKAS"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="text-lg font-bold tracking-tight text-foreground">SIKAS</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Aplikasi pencatatan keuangan sederhana untuk mengelola pengeluaran dan
              pemasukan. Data kamu tersimpan terenkripsi.
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                Surabaya, Indonesia
              </span>
              <a
                href="mailto:andinoferdiansah@gmail.com"
                className="flex items-center gap-3 py-1 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                andinoferdiansah@gmail.com
              </a>
            </div>
          </div>

          <nav aria-label="Navigasi footer">
            <h2 className="text-sm font-semibold text-foreground">Navigasi</h2>
            <ul className="mt-4 flex flex-col">
              {NAVIGASI.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Akun">
            <h2 className="text-sm font-semibold text-foreground">Akun</h2>
            <ul className="mt-4 flex flex-col">
              {AKUN.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-2 text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-border pt-8 text-sm text-muted-foreground">
          SIKAS Indonesia
        </p>
      </div>
    </footer>
  )
}
