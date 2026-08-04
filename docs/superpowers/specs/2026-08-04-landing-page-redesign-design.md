# Landing Page Redesign - Design Spec

Tanggal: 2026-08-04
Status: disetujui untuk masuk tahap perencanaan implementasi
Scope: landing page (`/`) lebih dulu, dengan perubahan token yang berlaku global

## 1. Konteks dan masalah

Ekstensi Impeccable menemukan 30 anti-pattern di landing page SIKAS. Angka 30 adalah
jumlah temuan, bukan skor. Kategori yang muncul: `low contrast text`, `ai color palette`,
`tiny body text`, `nested cards`, dan `cramped padding`.

Penelusuran ke kode menemukan penyebabnya terpusat, bukan tersebar:

| Temuan | Akar masalah | Lokasi |
| --- | --- | --- |
| low contrast text | `--primary: #0ea5e9` rasio 2,77:1 terhadap putih, gagal WCAG AA 4,5:1 | `src/app/globals.css:10` |
| ai color palette | Dua kartu gradasi biru ke hijau di mockup HP | `hero-section.tsx:136-166` |
| tiny body text | `text-[9px]` dan `text-[10px]` di dalam mockup HP | `hero-section.tsx:131,146,148,162,164,170,171,176,183` |
| nested cards | Kartu di dalam kartu di dalam bingkai HP, tiga lapis | `hero-section.tsx:111-192` |
| cramped padding | Padding disusutkan agar UI muat di dalam mockup selebar 240px | `hero-section.tsx:129-193` |

Di luar temuan ekstensi, ada dua masalah yang terbaca dari kode dan sama pentingnya.
Urutan mobile di hero terbalik: teks diberi `order-2` dan mockup `order-1`
(`hero-section.tsx:29`), jadi di HP pengunjung melihat gambar sebelum tahu ini aplikasi
apa. Dan setiap baris di stats memakai `truncate` (`stats-section.tsx:35-39`), yang
menyembunyikan teks alih-alih memuatnya.

## 2. Tujuan

1. Menghabiskan seluruh 30 temuan, bukan menguranginya.
2. Menghilangkan kesan "dibuat generator" lewat tipografi dan layout, bukan lewat efek.
3. Mobile-first sungguhan: tampilan HP adalah basis, bukan hasil penyusutan desktop.
4. Smooth scroll Lenis dan reveal GSAP yang halus, mati total saat reduced-motion.
5. Kode bersih tanpa tumpukan override, sesuai `docs/code-rules.md` dan `docs/fe-rules.md`.

## 3. Bukan tujuan

- Redesign visual dashboard. Token global berubah sehingga dashboard ikut bergeser
  warnanya, tapi perombakan layout dashboard adalah pekerjaan terpisah setelah landing
  disetujui.
- Perubahan backend, skema database, atau API. Tidak ada.
- Perubahan UI chatbot. Komponen `Chatbot` tetap seperti sekarang.
- Penambahan halaman baru.

## 4. Keputusan yang sudah dikunci

Empat keputusan diambil bersama user pada 2026-08-04.

**Warna dipertahankan, kepekatannya yang berubah.** User meminta palet tidak diganti.
Karena `#0ea5e9` mustahil lolos WCAG AA, hue biru SIKAS tetap dipakai tapi shade untuk
teks dan komponen kecil turun ke `#0369a1`. Secara visual masih biru SIKAS, hanya lebih
dalam. Logo dompet biru tidak perlu diubah.

**Token diubah global.** Perbaikan dilakukan sekali di `globals.css`, bukan di-scope ke
landing. Dashboard, login, dan form ikut lolos kontras tanpa sistem warna ganda.

**Mockup HP diganti konsep.** Bingkai HP dan isinya dibuang, diganti blok tipografi
berukuran penuh. Ini menghabiskan empat kategori temuan sekaligus.

**Motion halus dan terkendali.** Lenis untuk smooth scroll, GSAP ScrollTrigger untuk
reveal per section dan satu momen pin di hero. Tanpa parallax berlapis.

## 5. Sistem warna

Semua rasio dihitung terhadap putih `#ffffff`. Ambang WCAG AA: 4,5:1 untuk teks normal,
3:1 untuk teks besar dan komponen UI.

| Token | Nilai lama | Rasio lama | Nilai baru | Rasio baru | Pemakaian |
| --- | --- | --- | --- | --- | --- |
| `--primary` | `#0ea5e9` | 2,77:1 gagal | `#0369a1` | 5,93:1 lolos | teks tautan, latar tombol utama, angka penting |
| `--btn-primary-bg` | `#0ea5e9` | 2,77:1 gagal | `#0369a1` | 5,93:1 lolos | latar tombol utama |
| `--btn-primary-hover` | `#0284c7` | 4,09:1 gagal | `#075985` | 7,7:1 lolos | state hover tombol utama |
| `--primary-surface` | tidak ada | - | `#0ea5e9` | dekoratif | token baru, bidang besar non-teks, ikon di atas latar gelap |
| `--text-muted` | `#64748b` | 4,84:1 pas-pasan | `#475569` | 7,47:1 lolos | teks sekunder, caption, helper |
| `--success` | `#10b981` | 2,56:1 gagal | `#047857` | 5,55:1 lolos | teks nominal pemasukan |
| `--danger` | `#ef4444` | 3,74:1 gagal | `#b91c1c` | 6,54:1 lolos | teks nominal pengeluaran, pesan error |

`#0ea5e9` tidak dibuang. Ia pindah peran dari warna teks menjadi warna permukaan, dipakai
hanya untuk bidang besar tanpa teks kecil di atasnya, di mana ambang 3:1 sudah cukup.

Dua gradasi `--gradient-mbanking-*` dan `--gradient-cash-*` dihapus dari landing. Keduanya
tetap ada di token karena masih dipakai dashboard, dan dibereskan di pekerjaan lanjutan.

Aturan yang berlaku seterusnya: tidak ada teks berwarna di bawah 4,5:1, dan setiap
penambahan warna baru wajib dihitung rasionya sebelum masuk token.

## 6. Sistem tipografi

Plus Jakarta Sans dilepas. Font itu termasuk yang paling sering muncul di landing page
buatan generator, bersama Inter, Poppins, dan Manrope. Selama font-nya bertahan,
halamannya tetap terbaca sebagai template walau layout-nya dirombak.

| Peran | Font | Alasan |
| --- | --- | --- |
| Display dan heading | Instrument Serif | Serif kontras tinggi, jarang dipakai generator, memberi nada editorial yang cocok untuk produk keuangan |
| Body, UI, label, tombol | Archivo | Sama dengan portfolio andinoferdi, variable weight, netral tanpa terasa generik |
| Angka uang | Archivo dengan `font-variant-numeric: tabular-nums` | Digit rupiah harus rata lebar agar kolom nominal tidak bergeser saat nilainya berubah |

Keduanya diambil lewat `next/font/google` supaya tetap self-hosted dan tidak menambah
permintaan ke domain luar.

Skala tipografi, fluid dengan `clamp`, basis mobile:

| Peran | Ukuran | Font |
| --- | --- | --- |
| display | `clamp(2.5rem, 8vw, 5rem)` | Instrument Serif |
| h2 | `clamp(1.75rem, 4vw, 2.75rem)` | Instrument Serif |
| h3 | `1.25rem` | Archivo 600 |
| body | `1rem` | Archivo 400 |
| small | `0.875rem` | Archivo 400 |

**Lantai 14px.** Tidak ada teks di bawah `0.875rem` di mana pun pada landing page. Aturan
ini yang menghabiskan kategori `tiny body text`, dan berlaku permanen, bukan hanya saat
redesign.

## 7. Sistem layout

**Spacing.** Kelipatan 4px. Jarak antar section `py-16` di mobile, `py-24` mulai `md`,
`py-32` mulai `lg`. Padding tepi `px-5` di mobile, `px-8` mulai `md`. Lebar isi maksimum
`max-w-6xl` dengan tepi kiri yang konsisten dari nav sampai footer.

**Alignment.** Rata kiri, bukan rata tengah. Semua section sekarang memakai `text-center`,
dan teks rata tengah pada paragraf panjang adalah penanda template yang paling cepat
terbaca. Ini juga sejalan dengan `docs/fe-rules.md` baris 19: alignment konsisten, tidak
semua elemen harus rata tengah.

**Pemisah.** Kartu mengambang diganti garis rambut. Pola `rounded-2xl border shadow-sm`
yang diulang di tiap section membuat halaman terlihat seperti tumpukan kotak. Penggantinya
`border-t border-border` plus ruang kosong.

**Shadow.** Dihapus seluruhnya dari landing page. Kedalaman dibangun lewat ruang dan garis.

**Radius.** Dua nilai saja: `0` untuk elemen editorial dan pemisah, `0.5rem` untuk elemen
interaktif seperti tombol, input, dan kartu yang benar-benar bisa diklik. Radius penuh
`rounded-full` hanya untuk tombol utama.

## 8. Struktur halaman dari atas ke bawah

Urutan yang dilihat pengunjung tidak berubah. Yang berubah isinya, ditambah satu pemisahan
komponen: simulator tabungan dikeluarkan dari `cta-section` menjadi komponennya sendiri,
tapi posisinya di halaman tetap sama seperti sekarang.

### 8.1 LandingNav

Sticky di atas dengan latar `--card` dan `border-b` tipis. Mobile menampilkan logo dan
tombol menu. Desktop menampilkan tautan penuh mulai `lg`. Komponen `landing-nav-mobile`
dan `landing-nav-desktop` yang sudah ada dipertahankan, hanya token dan tipografinya yang
menyesuaikan.

State: default, scrolled (border muncul setelah scroll melewati 8px), menu terbuka di
mobile dengan scroll halaman dikunci lewat `stopPageScroll`.

### 8.2 HeroSection

Ini bagian yang dirombak paling dalam.

Urutan di mobile, satu kolom, dari atas ke bawah:

1. Judul display. Copy: "Kelola keuangan untuk **Semua**". Kata terakhir berotasi seperti
   sekarang, tapi transisinya pakai GSAP, bukan `setInterval` plus kelas kondisional.
2. Paragraf pendukung, `text-base`, maksimal dua baris.
3. Blok ringkasan bulanan sebagai tipografi berukuran penuh, bukan mockup HP. Isinya tiga
   baris: Pemasukan, Pengeluaran, Sisa, masing-masing dengan label `small` dan nominal
   berukuran `h3` memakai tabular figures. Dipisah garis rambut, tanpa kartu, tanpa
   gradasi, tanpa bingkai HP.
4. Dua tombol: "Mulai Sekarang" sebagai aksi utama, "Masuk" sebagai sekunder. Maksimal satu
   aksi dominan sesuai `fe-rules.md` baris 21.
5. Baris kepercayaan: Data Terenkripsi dan 100% Gratis, `small`, warna `--text-muted`.

Mulai `lg`, blok ringkasan pindah ke kolom kanan dan judul ke kiri. Urutan DOM tidak
diubah, jadi tidak ada lagi `order-1` dan `order-2` yang membalik prioritas di mobile.

Copy label blok ringkasan harus jujur bahwa ini contoh: "Contoh ringkasan bulan ini".
Nominal yang ditampilkan adalah data statis dan diberi atribut `aria-label` yang
menjelaskan itu contoh.

State: tidak ada state dinamis. Blok ini murni presentasional.

### 8.3 StatsSection

Kartu dan `divide-x` dibuang. Diganti baris empat kolom yang dipisah `border-t` saja, satu
kolom di mobile, dua mulai `sm`, empat mulai `lg`.

Setiap item: label `small` warna muted, nilai `h3` warna `--primary`, deskripsi `small`.
`truncate` dihapus seluruhnya. Kalau teks tidak muat, ukurannya yang disesuaikan, bukan
teksnya yang dipotong.

Isi dan copy tidak diubah sama sekali: Pencatatan Keuangan / Mudah, Keamanan /
Terenkripsi, Biaya Penggunaan / Gratis, Akses Aplikasi / 24-7. Redesign ini menyentuh
presentasi, bukan pesan.

### 8.4 FeaturesSection

Empat kartu ikon identik diganti daftar editorial bernomor. Kartu identik yang berjajar
adalah salah satu ciri yang disebut `fe-rules.md` baris 28.

Setiap butir: nomor urut dua digit dengan tabular figures, judul `h3`, deskripsi `body`,
dipisah `border-t`. Satu kolom di mobile, dua kolom mulai `md`. Ikon Lucide dipertahankan
tapi dikecilkan perannya jadi penanda, bukan pusat perhatian.

Isi tetap: Catat Transaksi, Pantau Keuangan, Kelola Kategori, Aman dan Privat.

### 8.5 SavingsSimulator

Simulator dipertahankan karena satu-satunya bagian yang benar-benar interaktif dan
berguna. Yang berubah presentasinya, plus dipisah dari `cta-section` agar tiap berkas
punya satu tujuan.

Struktur mobile, satu kolom: judul, dua input (Target Tabungan dan Tabungan Bulanan),
tombol "Hitung Simulasi", lalu hasil di bawahnya. Mulai `lg`, input di kiri dan hasil di
kanan.

State yang wajib ada dan harus jelas:

| State | Perilaku |
| --- | --- |
| kosong | Hasil belum tampil, ada kalimat penjelas apa yang akan muncul |
| loading | Tombol disabled dengan label "Menghitung" |
| valid | Hasil tampil: perkiraan durasi, total tabungan, nominal bulanan |
| error validasi | Pesan konkret di bawah input terkait, contoh "Target tabungan minimal Rp 10.000", bukan "Input tidak valid" |
| nol atau negatif | Ditolak di sisi klien dengan pesan spesifik |

Disclaimer "Simulasi ini hanya perkiraan" dipertahankan. Itu jujur dan harus tetap ada.

Progress bar gradasi biru ke hijau diganti bar satu warna `--primary` dengan latar
`--muted`, plus label persentase yang terbaca. Gradasi itu salah satu pemicu flag
`ai color palette`.

### 8.6 CtaSection

Setelah simulator dikeluarkan, section ini tinggal satu tugas: mengajak mendaftar. Satu
kalimat ajakan sebagai `h2`, satu tombol utama "Daftar Gratis Sekarang", tanpa kartu dan
tanpa latar berwarna. Tombolnya memakai `--btn-primary-bg` yang sudah diperbaiki, sehingga
flag `low contrast text` dan `cramped padding` di tombol ini hilang.

Copy dipertahankan: "Siap untuk mulai mencatat dan merencanakan keuanganmu?"

### 8.7 Footer

Struktur empat kolom dipertahankan karena isinya memang berbeda-beda, bukan kartu identik.
Satu kolom di mobile, dua mulai `sm`, empat mulai `lg`. Judul kolom `h3`, tautan `body`
dengan warna `--text-muted` dan `--primary` saat hover.

Alamat email `andinoferdiansah@gmail.com` dan lokasi Surabaya dipertahankan.

## 9. Motion

`LenisProvider` baru di `src/components/scroll/lenis-provider.tsx`, menyalin pola yang
sudah terbukti di portfolio andinoferdi:

- `new Lenis({ autoRaf: false, lerp: 0.12 })`
- GSAP ticker yang menggerakkan Lenis, jadi ScrollTrigger dan Lenis berbagi satu jam
- `lenis.on("scroll", ScrollTrigger.update)`
- `gsap.ticker.lagSmoothing(0)`
- `window.history.scrollRestoration = "manual"` supaya tiap muat ulang mulai dari atas
- keluar lebih awal tanpa membuat instance sama sekali saat
  `prefers-reduced-motion: reduce`
- `stopPageScroll` dan `startPageScroll` diekspor untuk mengunci scroll saat menu mobile
  terbuka

Reveal per section lewat satu komponen `Reveal` yang membungkus anak-anaknya dan memasang
ScrollTrigger sekali. Animasi: `opacity 0 ke 1` dan `y 24px ke 0`, durasi 0,6 detik,
stagger 0,08 detik, `ease: "power2.out"`, `once: true`.

Satu momen pin di hero: blok ringkasan bulanan tertahan sebentar saat judul lewat, hanya
mulai breakpoint `lg` ke atas. Di mobile dan tablet tidak ada pin sama sekali, karena
pin di layar kecil merusak pengalaman scroll.

Semua animasi dibungkus `gsap.matchMedia()` supaya breakpoint dan reduced-motion ditangani
di satu tempat, bukan lewat kondisional yang tersebar.

## 10. Aturan mobile-first

Ini aturan yang mengikat implementasi, bukan saran.

1. Style dasar tanpa prefix adalah tampilan HP, satu kolom, isi paling penting di atas.
2. Perluasan hanya lewat `sm:`, `md:`, `lg:`, `xl:`. Semuanya `min-width` di Tailwind.
3. Varian `max-*` dilarang. Kalau butuh, berarti basisnya yang salah.
4. Maksimal dua breakpoint per elemen. Lebih dari itu tandanya strukturnya perlu diubah,
   bukan kelasnya yang ditambah.
5. Tidak ada nilai arbitrer baru seperti `max-w-300`, `w-87.5`, atau `text-[9px]`. Pakai
   skala yang ada atau tambahkan token bernama.
6. Target sentuh minimal 44 x 44 px untuk semua elemen interaktif.

## 11. Peta perubahan file

| File | Jenis | Isi perubahan |
| --- | --- | --- |
| `src/app/globals.css` | ubah | Token warna baru, hapus token gradasi dari landing, tambah plumbing CSS Lenis |
| `src/app/layout.tsx` | ubah | Ganti Plus Jakarta Sans dengan Archivo dan Instrument Serif, pasang `LenisProvider` |
| `src/components/scroll/lenis-provider.tsx` | baru | Provider Lenis dan GSAP, ekspor stop dan start |
| `src/components/scroll/reveal.tsx` | baru | Pembungkus reveal berbasis ScrollTrigger |
| `src/components/scroll/index.ts` | baru | Barrel export mengikuti pola blocks yang ada |
| `src/blocks/landing/home/components/hero-section.tsx` | tulis ulang | Hero dipimpin tipografi, mockup HP dibuang |
| `src/blocks/landing/home/components/stats-section.tsx` | tulis ulang | Baris garis rambut, `truncate` dihapus |
| `src/blocks/landing/home/components/features-section.tsx` | tulis ulang | Daftar editorial bernomor |
| `src/blocks/landing/home/components/cta-section.tsx` | tulis ulang | Hanya ajakan mendaftar, simulator dipindah keluar |
| `src/blocks/landing/home/components/savings-simulator.tsx` | baru | Simulator dengan state lengkap, bar tanpa gradasi |
| `src/blocks/landing/home/components/index.ts` | ubah | Ekspor `SavingsSimulator` |
| `src/blocks/landing/home/index.tsx` | ubah | Sisipkan `SavingsSimulator` di antara features dan CTA |
| `src/blocks/landing/home/components/footer.tsx` | ubah | Token dan tipografi |
| `src/blocks/landing/home/components/landing-nav*.tsx` | ubah | Token, tipografi, kunci scroll lewat Lenis |
| `package.json` | ubah | Tambah `gsap` dan `lenis` |

`cta-section.tsx` sekarang 194 baris dan memuat dua hal berbeda: simulator dan ajakan
mendaftar. Keduanya dipisah jadi `savings-simulator.tsx` dan `cta-section.tsx` agar tiap
berkas punya satu tujuan.

## 12. Cara verifikasi

1. `npm run build` harus lolos tanpa error.
2. `npm run lint` harus bersih. Tidak ada test suite di repo ini.
3. Jalankan ulang Impeccable di landing page. Target: nol temuan. Bila masih ada, catat
   sisanya beserta alasannya, jangan diklaim selesai.
4. Cek kontras manual pada enam token di bagian 5 memakai DevTools, bukan mengandalkan
   perhitungan di dokumen ini saja.
5. Uji di lebar 360px, 768px, dan 1440px. Tidak boleh ada scroll horizontal di 360px.
6. Aktifkan `prefers-reduced-motion` di DevTools dan pastikan Lenis tidak dibuat sama
   sekali serta halaman tetap bisa di-scroll normal.
7. Navigasi keyboard: fokus terlihat di semua tautan dan tombol, urutan tab masuk akal,
   menu mobile bisa ditutup dengan Escape.

## 13. Risiko dan hal yang perlu diawasi

**Dashboard ikut berubah.** Token diubah global, jadi tombol dan teks di dashboard, login,
dan form ikut menjadi lebih pekat. Ini disengaja dan disetujui, tapi dashboard perlu
diperiksa visualnya di pekerjaan lanjutan. Dua gradasi kartu saldo di dashboard masih
memakai `#0ea5e9` dan `#10b981` dan belum disentuh di sini.

**Dependensi bertambah.** `gsap` dan `lenis` menambah sekitar 70 KB terkompresi. Dapat
diterima karena keduanya inti dari hasil yang diminta, tapi keduanya harus dimuat hanya di
sisi klien lewat komponen `"use client"` supaya tidak masuk bundle server.

**Font berubah untuk seluruh aplikasi.** `layout.tsx` adalah root, jadi dashboard ikut
memakai Archivo. Ini justru diinginkan demi konsistensi, tapi perlu dicek agar tabel dan
form di dashboard tidak berubah tinggi barisnya secara mencolok.

**Rotasi kata di hero.** Implementasi sekarang memakai `setInterval` dan dapat bocor bila
komponen dilepas saat animasi berjalan. Versi GSAP harus dibersihkan lewat `gsap.context`.

## 14. Hal yang sengaja tidak diputuskan di sini

Tidak ada. Seluruh pertanyaan terbuka sudah dijawab pada sesi brainstorming 2026-08-04.
Bila muncul pertanyaan baru saat implementasi, jawabannya ditulis balik ke dokumen ini,
bukan diputuskan diam-diam.
