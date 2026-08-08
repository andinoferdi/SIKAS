import Link from "next/link"

export default function RegisterNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold text-foreground">Halaman Tidak Ditemukan</h1>
        <p className="text-muted-foreground">
          Halaman pendaftaran yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
        >
          Kembali ke Daftar
        </Link>
      </div>
    </div>
  )
}
