import Link from "next/link"

export default function AddTransactionNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-lg font-semibold text-foreground">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground">
          Halaman tambah transaksi tidak tersedia.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  )
}
