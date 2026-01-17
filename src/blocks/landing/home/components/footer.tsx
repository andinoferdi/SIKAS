"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="SIKAS"
                  width={24}
                  height={24}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="font-bold text-lg text-foreground">SIKAS</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Aplikasi pencatatan keuangan sederhana untuk membantu Anda mengelola pengeluaran dan pemasukan dengan mudah.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Navigasi</h4>
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
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Akun</h4>
            <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
              <Link href="/login" className="hover:text-primary transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="hover:text-primary transition-colors">
                Daftar
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 SIKAS. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
