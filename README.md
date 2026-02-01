# SIKAS - Sistem Informasi Keuangan Anda Sendiri

Aplikasi pencatatan keuangan pribadi dengan AI chatbot untuk membantu mengelola pemasukan dan pengeluaran Anda.

## Akses Langsung

Kunjungi website langsung di: **[sikas-noyu.vercel.app](https://sikas-noyu.vercel.app/)**

## Menjalankan di Lokal

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- [Git](https://git-scm.com/)

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone https://github.com/andinoferdi/SIKAS.git
   cd SIKAS
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Jalankan aplikasi**

   ```bash
   npm run dev
   ```

4. **Buka browser** dan akses `http://localhost:3000`

## Cara Menggunakan

### 1. Registrasi & Login

- Buat akun baru atau login dengan akun yang sudah ada
- Anda akan diarahkan ke Dashboard

### 2. Mencatat Transaksi

- Klik tombol **"+"** di navigasi bawah (mobile) atau menu **"Tambah Transaksi"** (desktop)
- Pilih jenis: Pemasukan atau Pengeluaran
- Isi jumlah, kategori, dan metode pembayaran (Cash/M-Banking)

### 3. Menggunakan AI Chatbot

- Klik ikon chat di pojok kanan bawah
- Ketik perintah seperti:
  - _"Catat pengeluaran makan 50rb"_
  - _"Tampilkan transaksi bulan ini"_
  - _"Berapa saldo saya?"_
- AI akan membantu mencatat dan mengelola keuangan Anda

### 4. Melihat Ringkasan

- Dashboard menampilkan saldo M-Banking dan Cash
- Lihat ringkasan pemasukan, pengeluaran, dan selisih bulanan

## Tech Stack

- **Framework**: Next.js (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS
- **State Management**: Zustand, TanStack Query
- **Form**: React Hook Form + Zod
- **AI**: Xenova Transformers

## Lisensi

MIT License - bebas digunakan untuk keperluan pribadi dan komersial.
