# Dashboard Redesign - Design Spec

Tanggal: 2026-08-08
Branch: `andinoferdi/feat/dashboard-redesign`
Status: disetujui, siap masuk tahap rencana implementasi

## Masalah

Landing page, footer, login, register, FAQ, guide, dan chatbot sudah selesai diredesign dan
berjalan di atas satu sistem token: Inter, primary `#0ea5e9`, lantai teks 14px, radius
`--radius: 0.75rem`. Dashboard belum ikut. Hasilnya dua bahasa visual berbeda di satu aplikasi.

Audit Impeccable menemukan 19 anti-pattern di halaman dashboard:

| Flag | Lokasi | Penyebab di kode |
| --- | --- | --- |
| ai color palette | kartu M-Banking dan Cash | gradasi inline dari `--gradient-mbanking-*` / `--gradient-cash-*` |
| positioned child clipped by overflow container | kartu M-Banking dan Cash | dua div lingkaran absolut di dalam `overflow-hidden` |
| low contrast text | kartu saldo | token `--on-surface-muted` (putih 0.7) dan `--on-surface-variant` (putih 0.9) di atas biru/hijau terang |
| low contrast text | tombol Simpan Transaksi | sebagian artefak state `disabled`, sebagian karena `bg-primary` `#0ea5e9` dengan teks putih hanya 2,77:1 |
| nested cards | tiga kartu Ringkasan Bulanan | kartu anak berlatar dan berborder di dalam kartu pembungkus |

Temuan tambahan di luar audit, ditemukan saat membaca kode dan relevan dengan target mobile-first:

- Dua kartu saldo memakai `grid-cols-2` sejak breakpoint terkecil, jadi nominal harus muat di
  kolom ~165px pada layar 375px. Ini desain desktop yang disusutkan.
- Tombol edit dan hapus di `transaction-item.tsx` memakai `p-2` dengan ikon 16px, target sentuh
  sekitar 32px, di bawah ambang 44px, dan keduanya berdempetan. Risiko salah pencet tombol hapus.
- Konfirmasi hapus memakai `confirm()` bawaan browser, yang tidak bisa ditata dan tidak konsisten
  dengan sisa aplikasi. Sudah diverifikasi: `src/components/ui/` belum punya primitive dialog sama
  sekali (isinya hanya button, card, date-picker, error-state, input, select, tabs), dan
  `src/components/chatbot/batch-action-confirmation.tsx` bersifat khusus aksi batch chatbot, bukan
  komponen umum. Jadi penggantinya harus dibangun.

## Batasan

- **taste-skill bukan acuan tata letak.** Skill itu menyatakan dirinya out of scope untuk dashboard
  dan UI produk padat. Aturan landing seperti larangan total bayangan atau struktur hero tidak
  berlaku. Acuan utama adalah `docs/fe-rules.md`. Dari taste-skill hanya diambil nalurinya: buang
  gradasi, satu aksen konsisten, motion tertahan dan bermotivasi.
- **Landing tidak boleh tersentuh.** Semua perubahan token bersifat menambah, bukan mengubah nilai
  yang sudah dipakai halaman yang selesai.
- **Mobile-first wajib.** Kelas dasar untuk layar sempit, `sm`/`lg` hanya menambah. Semua breakpoint
  min-width, tidak ada varian `max-*`. Tidak menumpuk override.
- **Struktur navigasi tidak diubah.** Tidak ada bukti masalah di audit.

## Keputusan desain

### 1. Token

Menambah:

```css
--primary-solid: #0369a1;   /* permukaan terisi berteks putih, 5,93:1 */
--fund-mbanking: #0ea5e9;   /* aksen sumber dana, dipakai di chip ikon */
--fund-cash: #10b981;
```

Menghapus: `--gradient-mbanking-from`, `--gradient-mbanking-to`, `--gradient-cash-from`,
`--gradient-cash-to`, beserta pemetaan `--color-gradient-*` di blok `@theme`.

`#0ea5e9` tetap jadi identitas untuk teks link, ikon, border fokus, dan chip M-Banking, yaitu
tempat dia tidak menanggung teks putih. `--primary-solid` hanya dipakai saat teks putih duduk di
atas biru: tombol primer dan badge terisi. Mata membaca keduanya sebagai biru yang sama, jadi
identitas tidak berubah, tapi aksi utama jadi terbaca.

Alternatif yang ditolak: mengganti `--primary` global jadi `#0369a1`. Paling bersih secara sistem,
tapi membalik keputusan desain yang sudah diambil sadar di landing dan mengubah halaman yang sudah
selesai di-review. Jauh melampaui cakupan task ini.

### 2. Kartu saldo (`balance-card.tsx`)

Kartu datar `bg-card` dengan `border-border` dan `rounded-xl`, sama dengan kartu lain di halaman.
Dihapus: dua div lingkaran absolut, `overflow-hidden`, seluruh `style` inline, dan semua pemakaian
keluarga token `--on-surface-*`.

Isi kartu: chip ikon 40px dengan latar warna sumber dana pada opasitas 10 persen dan ikon berwarna
penuh, judul di sampingnya, lalu nominal `text-xl` di mobile naik ke `text-2xl` di `sm`, warna
`text-foreground`. Label "Saldo" dibuang karena mengulang judul kartu dan hanya memakan tinggi.

Grid tetap `grid-cols-2` sejak mobile supaya kedua saldo terlihat sekaligus tanpa scroll, karena
membandingkan dua sumber dana adalah tugas utama halaman ini. Kompensasi kesempitan: `gap-3` dan
`p-4` di mobile, naik ke `gap-4` dan `p-5` di `sm`.

`hover:shadow-lg` diganti perubahan border yang lebih tenang, karena di perangkat sentuh hover
tidak pernah terjadi.

### 3. Ringkasan bulanan (`summary-card.tsx`)

Tiga kartu anak kehilangan latar dan border. Judul dan bulan tetap di atas, lalu tiga baris dipisah
`divide-y divide-border`: ikon kecil dan label di kiri, nominal rata kanan. Warna pindah ke ikon dan
nominal saja (`text-success`, `text-danger`, dan untuk Selisih tetap bercabang antara positif dan
negatif seperti logika sekarang).

Dari `sm` ke atas tiga baris jadi tiga kolom dengan pemisah vertikal, jadi bentuk desktop yang
sekarang tidak hilang, hanya kehilangan kotak-kotaknya.

Nominal naik ke `text-base font-semibold` supaya angka menang atas label. `truncate` dilepas karena
satu baris penuh jauh lebih lapang daripada sepertiga lebar.

Alternatif yang ditolak: membuang kartu pembungkus dan menaikkan tiga kartu anak jadi kartu setara
di level halaman. Menghasilkan lima kartu sejenis berjajar, yang masuk larangan `fe-rules.md` soal
terlalu banyak kartu identik, dan judul beserta konteks bulan kehilangan tempat.

### 4. Daftar transaksi (`transaction-item.tsx`, `transaction-list.tsx`)

- Target sentuh tombol edit dan hapus dinaikkan ke 44px dengan jarak antar tombol yang layak.
- Penyelarasan tipografi dan spacing ke sistem.
- `confirm()` diganti komponen dialog konfirmasi baru (lihat bagian 5).

### 5. Komponen baru: dialog konfirmasi (`src/components/ui/confirm-dialog.tsx`)

Karena belum ada primitive dialog di project, komponen ini dibangun sebagai bagian dari task ini.
Ini satu-satunya penambahan fungsional di luar pekerjaan visual, dan disepakati masuk supaya alur
hapus transaksi konsisten dengan sisa aplikasi dalam satu kali kerja.

Kebutuhan minimum:

- Props: `open`, `onOpenChange`, `title`, `description`, `confirmLabel`, `cancelLabel`,
  `onConfirm`, dan varian `destructive` untuk aksi hapus.
- Aksesibilitas: `role="dialog"` dengan `aria-modal`, focus trap selama terbuka, tutup dengan
  Escape, fokus dikembalikan ke elemen pemicu saat ditutup, dan fokus awal jatuh ke tombol batal
  bukan tombol konfirmasi supaya aksi merusak tidak terpicu tanpa sengaja.
- Visual: mengikuti token yang sama dengan kartu dan form, tombol konfirmasi destruktif memakai
  token danger, bukan `--primary-solid`.
- Scroll body dikunci selama dialog terbuka.

Dipakai di `transaction-item.tsx` menggantikan `confirm()`. Tidak dipasang di tempat lain pada
task ini supaya cakupan tetap terkendali.

### 6. Form transaksi (`transaction-form-fields.tsx`, `add-transaction/`, `edit-transaction-modal.tsx`)

- Pemilih metode pembayaran berhenti memakai `text-primary` di atas `bg-primary/10`. Label jadi
  `text-foreground`, penanda terpilih pindah ke border dan ikon berwarna. Tambah `aria-pressed`
  yang sekarang belum ada.
- Tombol Simpan Transaksi memakai `--primary-solid`.
- Tombol tetap `disabled` saat form belum valid, tapi opasitasnya jelas terbaca sebagai mati dan
  diberi helper text di bawahnya yang menyebut apa yang masih kurang, misal "Isi jumlah dan
  kategori dulu". Sesuai `fe-rules.md` yang mewajibkan state disabled jelas dan pesan konkret.
- Sisa field mengikuti lantai 14px dan skala radius. Struktur dan alur validasi react-hook-form
  tidak diubah.

### 7. Kerangka layout (`src/components/layout/`, 7 berkas)

Penyelarasan token saja. Tujuh berkas disisir untuk: nilai warna hardcode, radius di luar skala
`--radius`, ukuran teks di bawah lantai 14px, spacing ganjil, dan target sentuh di bawah 44px pada
bottom-nav dan tombol header. Struktur, susunan menu, dan perilaku tidak disentuh.

Alasan tidak redesign penuh: tujuh berkas ini tidak muncul sama sekali di 19 flag Impeccable, jadi
sudah bersih dari anti-pattern. Menyentuh navigasi berarti menyentuh cara user berpindah halaman,
dan tidak ada bukti masalahnya di audit.

## Cakupan berkas

`src/app/globals.css` (token), sembilan berkas di `src/blocks/dashboard/`, tujuh berkas di
`src/components/layout/`, plus satu berkas baru `src/components/ui/confirm-dialog.tsx` beserta
pendaftarannya di `src/components/ui/index.ts`. Total 18 berkas disentuh, 1 dibuat.

## Verifikasi

1. `npm run lint`
2. `npm run build:check` (build terisolasi ke `.next-check` supaya tidak menabrak dev server)
3. `npm run check:contrast`
4. Buka dashboard di browser pada 375px, 768px, dan 1280px, pastikan 19 flag benar-benar hilang,
   bukan berpindah tempat.

## Kriteria selesai

- Nol flag Impeccable di halaman dashboard.
- Tidak ada pemakaian `--gradient-*` yang tersisa di seluruh repo.
- Tidak ada varian `max-*` di berkas yang disentuh.
- Landing page tidak berubah secara visual.
- Semua target sentuh interaktif minimal 44px.
- Tidak ada `confirm()` bawaan browser yang tersisa di `src/blocks/dashboard/`.
- Dialog konfirmasi bisa ditutup dengan Escape dan mengembalikan fokus ke tombol pemicu.
