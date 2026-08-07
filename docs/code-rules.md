# Code Rules

## Peran
Anda coding agent untuk project `SIKAS` dengan stack `Next.js Route Handlers (TypeScript)` + `Next.js App Router + React + Tailwind CSS` + `Supabase Postgres`. Baca konteks repo dulu, ikuti pola yang sudah ada, jaga perubahan minimal dan aman.

## Aktivasi
Aktif bersama A + B, atau saat pengguna meminta implementasi, audit, refactor, atau perbaikan kode.

## 1. Prinsip inti
- Pahami file terdekat, route/endpoint terkait, dan pola modul sebelum mengubah kode.
- Perubahan minimal dan spesifik pada task. Jangan refactor besar tanpa diminta.
- Jangan asumsikan stack di luar `Next.js Route Handlers (TypeScript)`/`Next.js App Router + React + Tailwind CSS` kecuali task membuktikan ada integrasi terpisah.
- Jangan mengubah perilaku bisnis, permission, query penting, atau kontrak API tanpa alasan yang bisa diverifikasi.
- Hapus import, variable, dan dependency mati saat menyentuh file terkait.
- Nama class, method, variable, route, dan komponen harus deskriptif.

## 2. Struktur & pola
- Ikuti struktur folder dan arsitektur nyata repo sebagai sumber kebenaran.
- Tambahkan file baru sedekat mungkin dengan domain terkait. Jangan buat struktur baru sebelum memeriksa pola sekitar.
- Pisahkan tanggung jawab sesuai pola repo: entry/route, controller/handler, validasi, service/logic, data layer, dan response.
- Pindahkan logic berat atau reusable ke layer yang sesuai, jangan menumpuk di controller/handler.

## 3. Data & query
- Hindari N+1 pada listing, tabel, export, dashboard, dan report.
- Gunakan pagination, limit, chunk, atau cursor untuk data besar.
- Pakai transaksi untuk tulis yang menyentuh banyak tabel, status penting, atau data finansial.
- Gunakan migration/mekanisme schema resmi untuk perubahan struktur `Supabase Postgres`, bukan edit manual tanpa jejak.
- Pertahankan filter akses (user, role, ownership, lokasi) yang sudah ada. Jangan hapus kondisi bisnis demi menyederhanakan kode.

## 4. Security & authorization
- Validasi semua input di server, bukan hanya client.
- Jangan percaya role, permission, harga, stok, status, atau ownership dari client tanpa verifikasi server-side.
- Semua action sensitif lewat auth dan authorization yang sesuai.
- Hindari SQL injection, mass assignment, IDOR, path traversal, dan upload tanpa validasi.
- Jangan hardcode secret, credential, URL production, token, atau API key di kode, view, test, maupun dokumentasi. Ambil dari environment/config.

## 5. Error handling
- Bungkus operasi berisiko (integrasi, upload, import/export, job, DB) dengan error handling.
- Log error teknis dengan konteks aman. Jangan log secret atau payload sensitif.
- Response tidak membocorkan stack trace, secret, token, atau path internal.
- Tampilkan pesan user jelas dan bisa ditindaklanjuti. Jangan telan exception diam-diam bila memengaruhi data atau alur bisnis.

## 6. Integrasi eksternal `OpenRouter API + Supabase`
- Semua URL, token, key, dan secret dari environment/config server-side.
- Tambahkan timeout, retry terbatas, fallback, atau idempotency bila relevan.
- Jangan anggap request sukses jika response eksternal masih 4xx/5xx atau data belum valid.

## 7. Proses berat & queue
- Gunakan job/queue/batch untuk import, export, sinkronisasi, dan proses batch.
- Jangan jalankan proses besar sinkron di request utama jika berisiko timeout.
- Pastikan job aman dijalankan ulang (idempotent) untuk import, webhook, payment, dan sync.

## 8. Dependencies
- Perubahan dependency minimal, relevan task, dan menjaga konsistensi manifest + lockfile.
- Jangan menambah library jika kebutuhan bisa dipenuhi stack atau helper yang ada.
- Hindari upgrade besar tanpa task khusus, review changelog, dan rencana regresi.

## 9. Sebelum & sesudah coding
Baca repo dan `git status` dulu. Setelah mengubah kode, jalankan verifikasi sesuai area perubahan (test untuk logic, build untuk asset). Tulis ringkasan: bagian yang benar, yang diubah, dan verifikasi yang dijalankan.

Jika RTK tersedia, awali shell command dengan `rtk` (contoh kritis):

```powershell
rtk git status
rtk npm run lint
rtk npm run build
```

## 10. Sumber kebenaran (WAJIB)
- Aturan ini harus konsisten dengan implementasi aktif di repo. Jika bertentangan dengan kode nyata, menangkan kebutuhan task, praktik aman, dan perilaku runtime nyata.
- Jaga konsistensi antara `code-rules.md`, `chat-rules.md`, `Agents.md`, config, route, database, test, dan perilaku aplikasi.
- Jika ada konflik pola ideal vs legacy, pilih perubahan terkecil yang menyelesaikan masalah tanpa merusak alur bisnis.
