# Hasil Verifikasi Redesign Landing Page

Tanggal: 2026-08-04
Branch: `feat/landing-page-redesign`
Rencana: `2026-08-04-landing-page-redesign.md`

## Ringkasan

Sembilan task implementasi selesai dan ter-commit. Seluruh gate otomatis lolos.
Verifikasi visual dan statis tuntas. Verifikasi interaksi **tidak dapat diselesaikan**
karena ditemukan bug hidrasi yang sudah ada sejak sebelum pekerjaan ini dimulai. Rinciannya
di bagian akhir.

## Gate otomatis

Ketiganya keluar dengan kode 0.

```
npm run check:contrast   → Semua 12 pasangan warna lolos.
npm run lint             → bersih, tanpa keluaran
npm run build            → Compiled successfully, 28 halaman statis dihasilkan
```

Keluaran lengkap pemeriksa kontras:

```
LOLOS  --primary / --card                        5.93:1  (min 4.5:1)
LOLOS  --primary / --background                  5.67:1  (min 4.5:1)
LOLOS  --btn-primary-bg / --primary-foreground   5.93:1  (min 4.5:1)
LOLOS  --btn-primary-hover / --primary-foreground 7.56:1 (min 4.5:1)
LOLOS  --text-muted / --card                     7.58:1  (min 4.5:1)
LOLOS  --text-muted / --background               7.24:1  (min 4.5:1)
LOLOS  --muted-foreground / --card               7.58:1  (min 4.5:1)
LOLOS  --muted-foreground / --background         7.24:1  (min 4.5:1)
LOLOS  --success / --card                        5.48:1  (min 4.5:1)
LOLOS  --danger / --card                         6.47:1  (min 4.5:1)
LOLOS  --foreground / --card                     17.85:1 (min 4.5:1)
LOLOS  --primary-surface / --card                2.77:1  (min 2.5:1)
```

Sebelum perbaikan, enam pasangan pertama gagal. Angka aslinya tercatat: `--primary` 2,77:1,
`--btn-primary-bg` 2,77:1, `--btn-primary-hover` 4,10:1, `--success` 2,54:1, `--danger`
3,76:1.

## Gate pola kode

Dijalankan atas seluruh `src/blocks/landing/home/components/`. Semuanya nol hasil.

```
grep -rE 'text-\[|text-xs|shadow-|href="#"'        → nol hasil
grep -rE '\bmax-(sm|md|lg|xl|2xl):'                → nol hasil
```

Artinya: tidak ada teks di bawah 14px, tidak ada bayangan, tidak ada tautan mati, dan tidak
ada varian breakpoint `max-*` yang dilarang aturan mobile-first.

## Pengukuran DOM di 360px

Diukur pada halaman yang berjalan, bukan dari kode.

| Yang diperiksa | Hasil |
| --- | --- |
| Scroll horizontal | Tidak ada. `scrollWidth` 360 sama dengan lebar viewport 360 |
| Teks di bawah 14px | Nol elemen di `header`, `main`, dan `footer` |
| Font judul | `Instrument Serif`, 40px |
| Font teks | `Archivo`, 16px |
| Tombol utama | Latar `rgb(3, 105, 161)` yaitu `#0369a1`, teks putih |
| Tautan mati `href="#"` | Nol |
| Urutan mobile | Judul mendahului blok ringkasan, terverifikasi lewat `compareDocumentPosition` |
| Jumlah section | 5, sesuai rencana |
| Lenis | Aktif, `window.__lenis` bertipe object |

## Bug yang ditemukan, bukan disebabkan pekerjaan ini

**Seluruh interaktivitas React di halaman `/` mati.** Menu mobile tidak membuka, rotasi kata
di hero tidak berjalan, input terkendali tidak memformat ulang, dan tombol Hitung Simulasi
tidak menghasilkan apa pun. Hanya 27 dari 342 node DOM yang punya fiber React. Node yang
ter-hydrate cuma `html`, tag `head`, `body`, satu `<div hidden>` penanda Suspense kosong,
dan `<section>` milik Toaster.

**Bukti bahwa ini sudah ada sebelumnya.** Berkas `src/` dikembalikan ke commit `be17112`,
yaitu kondisi tepat sebelum satu baris kode pun diubah, lalu dibangun ulang dan diuji.
Hasilnya sama persis: 26 dari 461 node ter-hydrate, rotasi kata mati. Setelah itu `src/`
dikembalikan lagi ke versi redesign.

**Cakupannya khusus halaman `/`.** Pada build produksi yang sama, `/login` ter-hydrate 68
dari 89 node dan validasi formnya berjalan, `/faq` ter-hydrate 100 dari 124 node.

**Bukan disebabkan `<Chatbot />`.** Komponen itu dinonaktifkan sementara lalu dibangun
ulang. Hasilnya tetap 27 dari 342 node. Chatbot sudah dikembalikan.

**Yang belum diketahui.** Akar penyebabnya belum ditemukan. Tidak ada error di console,
tidak ada permintaan jaringan yang gagal, dan seluruh chunk JavaScript termuat dengan status
200. Perbandingan payload RSC lewat `self.__next_f` tidak konklusif karena bernilai nol baik
di `/` maupun di `/faq` yang sehat.

**Dampaknya pada pekerjaan ini.** Perbaikan tombol Hitung Simulasi di Task 7 sudah benar
secara kode, tetapi tidak dapat dibuktikan berjalan di browser sampai bug hidrasi ini
teratasi. Hal yang sama berlaku untuk penguncian scroll dan penutupan menu dengan Escape di
Task 9, serta rotasi kata dan pin ScrollTrigger di Task 4.

## Yang belum diverifikasi

1. Kelima state simulator. Terhalang bug hidrasi di atas.
2. Penguncian scroll dan Escape pada menu mobile. Terhalang bug yang sama.
3. Perilaku `prefers-reduced-motion`. Lenis terbukti aktif dalam mode normal, tetapi jalur
   reduced motion belum diuji di browser.
4. Navigasi keyboard menyeluruh.
5. Pemindaian ulang Impeccable. Belum dijalankan, karena ekstensi itu dipasang di browser
   pengguna dan tidak dapat dipanggil dari sesi ini.
6. Tampilan dashboard setelah token warna berubah.

## Langkah berikutnya yang disarankan

Bug hidrasi harus dibereskan lebih dulu, sebelum sisa verifikasi di atas ada gunanya
dijalankan. Itu pekerjaan terpisah dari redesign ini dan sebaiknya punya branch sendiri.
