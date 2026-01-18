import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <Image
                src="/images/logo.png"
                alt="SIKAS"
                width={40}
                height={40}
                className="object-contain"
              />
              <span className="font-bold text-xl text-foreground">SIKAS</span>
            </div>

            <h5 className="font-semibold text-foreground mb-4">SIKAS Indonesia</h5>

            <div className="space-y-3 text-sm text-muted-foreground">
              <a
                href="#"
                className="flex items-start gap-3 hover:text-primary transition-colors"
              >
                <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                <span>Surabaya, Indonesia</span>
              </a>

              <a
                href="mailto:andinoferdiansah@gmail.com"
                className="flex items-center gap-3 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5 shrink-0" />
                <span>andinoferdiansah@gmail.com</span>
              </a>
            </div>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-4">Navigasi</h5>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <Link href="#fitur" className="hover:text-primary transition-colors">
                Fitur
              </Link>
              <Link href="#tentang" className="hover:text-primary transition-colors">
                Tentang
              </Link>
            </nav>

            <h5 className="font-semibold text-foreground mt-6 mb-4">Fitur</h5>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                Kelola Saldo
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Catat Transaksi
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Laporan Keuangan
              </Link>
            </nav>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-4">Lainnya</h5>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">
                FAQ
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="#" className="hover:text-primary transition-colors">
                Syarat dan Ketentuan
              </Link>
            </nav>

            <h5 className="font-semibold text-foreground mt-6 mb-4">Akun</h5>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="hover:text-primary transition-colors">
                Daftar
              </Link>
            </nav>
          </div>

          <div>
            <h5 className="font-semibold text-foreground mb-4">Tentang Aplikasi</h5>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              SIKAS adalah aplikasi pencatatan keuangan sederhana yang membantu Anda mengelola pengeluaran dan pemasukan dengan mudah.
            </p>

            <h5 className="font-semibold text-foreground mb-4">Keamanan Data</h5>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Data Anda terenkripsi dan tersimpan dengan aman. Kami berkomitmen menjaga privasi pengguna.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
