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

3. **Setup environment variables**

   Buat file `.env.local` di root folder dan isi dengan:

   ```env
   NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key
   NEXT_PUBLIC_SITE_NAME=SIKAS
   NEXT_PUBLIC_PRODUCTION_URL=https://sikas-noyu.vercel.app/
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SESSION_SECRET=your_session_secret_key
   ```

   Cara mendapatkan API key:
   - **OpenRouter**: Daftar di [openrouter.ai](https://openrouter.ai/) dan buat API key
   - **Supabase**: Buat project di [supabase.com](https://supabase.com/), lalu copy URL dan anon key dari Settings > API

4. **Setup database Supabase**

   Buat tabel-tabel berikut di Supabase SQL Editor:

   ```sql
   -- Tabel users
   create table users (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     pin text not null,
     mbanking_balance numeric default 0,
     cash_balance numeric default 0,
     created_at timestamp with time zone default now()
   );

   -- Tabel transactions
   create table transactions (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references users(id) on delete cascade,
     amount numeric not null,
     type text not null,
     category text not null,
     description text,
     payment_method text not null,
     transaction_date date not null,
     created_at timestamp with time zone default now()
   );

   -- Tabel knowledge_base_embeddings (untuk AI chatbot)
   create table knowledge_base_embeddings (
     id uuid primary key default gen_random_uuid(),
     content text not null,
     category text,
     metadata jsonb,
     embedding vector(384),
     created_at timestamp with time zone default now()
   );
   ```

   Aktifkan extension `vector` di Supabase: Database > Extensions > cari "vector" > Enable

   Kemudian disable RLS (Row Level Security) untuk semua tabel agar aplikasi bisa mengakses data:

   ```sql
   -- Disable RLS untuk semua tabel
   alter table users disable row level security;
   alter table transactions disable row level security;
   alter table knowledge_base_embeddings disable row level security;
   ```

   Atau melalui UI: Klik tabel > Authentication > Disable RLS

5. **Seed knowledge base untuk chatbot**

   Setelah aplikasi berjalan, buka browser dan akses:

   ```
   POST http://localhost:3000/api/chatbot/seed
   ```

   Atau gunakan curl:

   ```bash
   curl -X POST http://localhost:3000/api/chatbot/seed
   ```

6. **Jalankan aplikasi**

   ```bash
   npm run dev
   ```

7. **Buka browser** dan akses `http://localhost:3000`

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
