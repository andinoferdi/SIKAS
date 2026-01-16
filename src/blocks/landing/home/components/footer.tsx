"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center">
                <Image
                  src="/images/logo.png"
                  alt="SIKAS"
                  width={24}
                  height={24}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
              <span className="font-bold text-lg text-neutral-900">SIKAS</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-sm">
              Aplikasi pencatatan keuangan sederhana untuk membantu Anda mengelola pengeluaran dan pemasukan dengan mudah.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Navigasi</h4>
            <nav className="flex flex-col gap-3 text-sm text-neutral-600">
              <Link href="/" className="hover:text-sky-500 transition-colors">
                Beranda
              </Link>
              <Link href="#fitur" className="hover:text-sky-500 transition-colors">
                Fitur
              </Link>
              <Link href="#tentang" className="hover:text-sky-500 transition-colors">
                Tentang
              </Link>
            </nav>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Akun</h4>
            <nav className="flex flex-col gap-3 text-sm text-neutral-600">
              <Link href="/login" className="hover:text-sky-500 transition-colors">
                Masuk
              </Link>
              <Link href="/register" className="hover:text-sky-500 transition-colors">
                Daftar
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-neutral-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            &copy; 2026 SIKAS. Hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4 text-xs text-neutral-500">
            <a href="#" className="hover:text-sky-500 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-sky-500 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
