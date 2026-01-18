import type { KnowledgeSeedEntry } from "@/types/rag"

export const knowledgeData: KnowledgeSeedEntry[] = [
  {
    content:
      "SIKAS adalah aplikasi pencatatan keuangan gratis untuk keluarga dan pribadi yang dapat diakses 24/7 melalui browser dengan keamanan terenkripsi.",
    category: "features",
    metadata: { tags: ["about", "intro"] },
  },
  {
    content:
      "Dashboard SIKAS menampilkan saldo M-Banking dan Cash secara terpisah, ringkasan bulanan (total pemasukan, pengeluaran, selisih), dan daftar transaksi terbaru.",
    category: "features",
    metadata: { tags: ["dashboard", "saldo"] },
  },
  {
    content:
      "Fitur Tambah Transaksi memungkinkan user mencatat pemasukan atau pengeluaran dengan memilih jenis, jumlah, kategori, metode pembayaran, dan tanggal.",
    category: "features",
    metadata: { tags: ["transaksi", "add"] },
  },
  {
    content:
      "Riwayat Transaksi menampilkan semua transaksi dengan filter berdasarkan bulan, tahun, dan jenis transaksi. User dapat mengedit atau menghapus transaksi.",
    category: "features",
    metadata: { tags: ["riwayat", "history", "filter"] },
  },
  {
    content:
      "SIKAS mendukung dua metode pembayaran: M-Banking untuk saldo digital/rekening bank, dan Cash untuk uang tunai yang dipegang langsung.",
    category: "features",
    metadata: { tags: ["pembayaran", "metode"] },
  },

  {
    content:
      "Cara menambah transaksi: Klik tombol 'Tambah Transaksi' di Dashboard, pilih jenis (Pemasukan/Pengeluaran), masukkan jumlah, pilih kategori, pilih metode pembayaran (M-Banking/Cash), tambah deskripsi opsional, pilih tanggal, lalu klik Simpan.",
    category: "tutorial",
    metadata: { tags: ["cara", "tambah", "transaksi"] },
  },
  {
    content:
      "Cara melihat riwayat transaksi: Klik menu 'Transaksi' di sidebar atau bottom navigation, gunakan filter untuk memilih bulan dan tahun, atau filter berdasarkan jenis transaksi (Semua/Masuk/Keluar).",
    category: "tutorial",
    metadata: { tags: ["cara", "riwayat", "lihat"] },
  },
  {
    content:
      "Cara mendaftar di SIKAS: Klik tombol 'Daftar' di halaman utama, masukkan nama (minimal 2 karakter), buat PIN 4-6 digit angka, konfirmasi PIN, lalu klik tombol Daftar.",
    category: "tutorial",
    metadata: { tags: ["cara", "daftar", "registrasi"] },
  },
  {
    content:
      "Cara login ke SIKAS: Klik tombol 'Masuk' di halaman utama, masukkan nama yang sudah terdaftar, masukkan PIN, lalu klik tombol Masuk.",
    category: "tutorial",
    metadata: { tags: ["cara", "login", "masuk"] },
  },
  {
    content:
      "Cara mengedit transaksi: Buka halaman Riwayat Transaksi, klik pada transaksi yang ingin diedit, ubah data yang diperlukan, lalu klik Simpan.",
    category: "tutorial",
    metadata: { tags: ["cara", "edit", "ubah"] },
  },
  {
    content:
      "Cara menghapus transaksi: Buka halaman Riwayat Transaksi, klik pada transaksi yang ingin dihapus, klik tombol Hapus, lalu konfirmasi penghapusan.",
    category: "tutorial",
    metadata: { tags: ["cara", "hapus", "delete"] },
  },

  {
    content:
      "Saldo minimum M-Banking di SIKAS adalah Rp 50.000. Transaksi pengeluaran tidak dapat dilakukan jika akan menyebabkan saldo M-Banking di bawah batas minimum.",
    category: "rules",
    metadata: { tags: ["aturan", "saldo", "minimum"] },
  },
  {
    content:
      "PIN SIKAS harus terdiri dari 4-6 digit angka. Nama pengguna minimal 2 karakter dan hanya boleh mengandung huruf dan spasi.",
    category: "rules",
    metadata: { tags: ["aturan", "pin", "nama"] },
  },
  {
    content:
      "Kategori pemasukan yang tersedia: Gaji, Bonus, Transfer Masuk, dan Lainnya. Kategori pengeluaran: Makan, Transport, Belanja, Tagihan, dan Lainnya.",
    category: "rules",
    metadata: { tags: ["kategori", "pemasukan", "pengeluaran"] },
  },
  {
    content:
      "Transaksi pengeluaran tidak bisa melebihi saldo yang tersedia di metode pembayaran yang dipilih (M-Banking atau Cash).",
    category: "rules",
    metadata: { tags: ["aturan", "saldo", "pengeluaran"] },
  },

  {
    content:
      "Perbedaan M-Banking dan Cash: M-Banking adalah saldo digital dengan batas minimum Rp 50.000, sedangkan Cash adalah uang tunai tanpa batas minimum.",
    category: "faq",
    metadata: { tags: ["perbedaan", "mbanking", "cash"] },
  },
  {
    content:
      "SIKAS tidak memerlukan email atau nomor telepon untuk mendaftar. Cukup gunakan nama dan PIN untuk login. Data tersimpan aman di cloud dengan enkripsi.",
    category: "faq",
    metadata: { tags: ["login", "email", "keamanan"] },
  },
  {
    content:
      "Untuk melihat total pengeluaran atau pemasukan bulan ini, buka Dashboard. Di sana akan ditampilkan ringkasan bulanan dengan total pemasukan, pengeluaran, dan selisih.",
    category: "faq",
    metadata: { tags: ["total", "ringkasan", "bulan"] },
  },
  {
    content:
      "Jika lupa PIN, saat ini belum ada fitur reset PIN. Silakan hubungi administrator atau buat akun baru dengan nama berbeda.",
    category: "faq",
    metadata: { tags: ["lupa", "pin", "reset"] },
  },
  {
    content:
      "SIKAS dapat diakses dari browser manapun di komputer atau smartphone. Tidak perlu install aplikasi karena SIKAS adalah web application.",
    category: "faq",
    metadata: { tags: ["akses", "browser", "mobile"] },
  },

  {
    content:
      "Kamu bisa menambah transaksi lewat chat dengan mengatakan seperti: 'Catat pengeluaran makan 50 ribu pakai cash' atau 'Tambah pemasukan gaji 5 juta ke M-Banking'. Bot akan otomatis mencatat transaksimu.",
    category: "tutorial",
    metadata: { tags: ["chatbot", "catat", "tambah", "aksi"] },
  },
  {
    content:
      "Untuk mencari transaksi lewat chat, katakan seperti: 'Cari transaksi makan bulan ini' atau 'Tampilkan pengeluaran transport minggu lalu'. Bot akan menampilkan transaksi yang sesuai.",
    category: "tutorial",
    metadata: { tags: ["chatbot", "cari", "search", "aksi"] },
  },
  {
    content:
      "Bot SIKAS bisa melihat saldo dan transaksimu secara real-time. Tanya saja 'Berapa saldo saya?' atau 'Transaksi terakhir apa?' untuk informasi keuanganmu.",
    category: "features",
    metadata: { tags: ["chatbot", "saldo", "realtime"] },
  },

  {
    content:
      "Tips keuangan: Jika pengeluaran lebih besar dari pemasukan dalam sebulan, coba kurangi pengeluaran di kategori terbesar atau cari sumber pemasukan tambahan.",
    category: "faq",
    metadata: { tags: ["tips", "keuangan", "pengeluaran"] },
  },
  {
    content:
      "Tips menabung: Sisihkan minimal 10-20% dari pemasukan untuk ditabung. Catat sebagai 'Transfer Masuk' ke M-Banking agar terpisah dari uang Cash sehari-hari.",
    category: "faq",
    metadata: { tags: ["tips", "nabung", "tabung", "saving"] },
  },
  {
    content:
      "Tips pencatatan: Catat transaksi sesegera mungkin setelah terjadi agar tidak lupa. Gunakan deskripsi singkat untuk memudahkan pencarian nanti.",
    category: "faq",
    metadata: { tags: ["tips", "catat", "deskripsi"] },
  },

  {
    content:
      "Error 'Saldo tidak cukup' muncul jika pengeluaran melebihi saldo yang tersedia. Pastikan saldo M-Banking atau Cash mencukupi sebelum mencatat pengeluaran.",
    category: "faq",
    metadata: { tags: ["error", "saldo", "tidak cukup"] },
  },
  {
    content:
      "Error 'Minimal saldo M-Banking Rp 50.000' muncul jika pengeluaran akan menyebabkan saldo M-Banking di bawah batas minimum. Gunakan Cash atau kurangi jumlah pengeluaran.",
    category: "faq",
    metadata: { tags: ["error", "minimum", "mbanking"] },
  },
  {
    content:
      "Saat menghapus transaksi, saldo akan otomatis dikembalikan. Jika hapus pemasukan, saldo berkurang. Jika hapus pengeluaran, saldo bertambah kembali.",
    category: "rules",
    metadata: { tags: ["hapus", "saldo", "reversal"] },
  },

  {
    content:
      "Duit, uang, dana, saldo - semuanya merujuk pada jumlah uang yang kamu miliki di SIKAS. Cek di Dashboard untuk melihat total duit M-Banking dan Cash.",
    category: "faq",
    metadata: { tags: ["duit", "uang", "dana", "slang"] },
  },
  {
    content:
      "Keluar duit, bayar, beli, jajan - semua ini adalah pengeluaran. Catat sebagai transaksi 'Pengeluaran' dengan kategori yang sesuai seperti Makan, Transport, atau Belanja.",
    category: "faq",
    metadata: { tags: ["keluar", "bayar", "beli", "jajan", "slang"] },
  },
]

export function getKnowledgeCount(): number {
  return knowledgeData.length
}


export function getKnowledgeByCategory(
  category: KnowledgeSeedEntry["category"]
): KnowledgeSeedEntry[] {
  return knowledgeData.filter((entry) => entry.category === category)
}
