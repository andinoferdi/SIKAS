# Bug Hidrasi Halaman `/` - Catatan Investigasi

Tanggal: 2026-08-04
Status: **penyebab terkarakterisasi, belum diperbaiki**
Branch: `feat/landing-page-redesign`

## Gejala

Seluruh interaktivitas React di halaman `/` mati. Menu tidak membuka, rotasi kata di hero
diam, input terkendali tidak memformat ulang, tombol form tidak menghasilkan apa pun.
Hanya sekitar 27 node DOM yang punya fiber React, yaitu `html`, tag di `head`, `body`,
satu `<div hidden>` penanda Suspense kosong, dan `<section>` milik Toaster. HTML server
render dengan benar dan lengkap.

Tidak ada error di console, tidak ada permintaan jaringan gagal, seluruh chunk JavaScript
termuat dengan status 200.

## Temuan utama: ini ambang ukuran, bukan komponen

Diukur di build produksi, `npx next start`, dengan menghitung node yang punya properti
`__react*`.

| Isi halaman | Node DOM | Ter-hydrate | Status |
| --- | --- | --- | --- |
| HeroSection saja | 87 | 63 | sehat 72% |
| LandingNav tanpa anak + Hero | 99 | 74 | sehat 75% |
| Hero + Stats | 109 | 84 | sehat 77% |
| `/login` (rute lain) | 89 | 68 | sehat 76% |
| `/faq` (rute lain) | 124 | 100 | sehat 81% |
| Hero + Stats + Features | 153 | 125 | sehat 82% |
| Hero + Stats + Features + Simulator | 175 | 147 | sehat 84% |
| ...ditambah CtaSection | 191 | 29 | **rusak 15%** |
| ...ditambah 60 paragraf statis saja | 247 | 29 | **rusak 12%** |
| LandingNav + Hero | 203 | 27 | **rusak 13%** |
| Halaman penuh | 259 | 29 | **rusak 11%** |

Baris terakhir yang menentukan: menambahkan **60 paragraf statis tanpa satu pun komponen
atau import baru** ikut merusak hidrasi. Jadi tidak ada komponen yang bersalah. Ambangnya
ada di antara 175 dan 191 node DOM.

## Yang sudah disingkirkan

Setiap butir diuji dengan build produksi bersih tersendiri.

| Dugaan | Hasil |
| --- | --- |
| Regresi dari redesign ini | Bukan. `src/` dikembalikan ke commit `be17112` lalu dibangun ulang, tetap rusak 26 dari 461 node |
| `next/image` | Bukan |
| Pembungkus `memo()` | Bukan |
| Render ikon dinamis `<feature.icon />` | Bukan |
| React Compiler | Bukan. Diuji dengan `reactCompiler: false` |
| Barrel `@/lib/utils` | Bukan. Dipakai juga oleh `Button` di Hero yang sehat |
| Komponen `Chatbot` | Bukan |
| Komponen `Reveal` | Bukan. Dijadikan passthrough tanpa GSAP, tetap rusak |
| `landing-nav-desktop` dan `landing-nav-mobile` | Bukan. Sudah ditulis ulang total dan dihapus |
| BOM di awal berkas | Bukan penyebab hidrasi, tapi tetap dibersihkan di commit `dfcea94` |
| `src/app/loading.tsx` dan Suspense-nya | Bukan |
| Payload RSC terpotong | Bukan. Payload utuh, kurung siku seimbang, nol gagal parse |
| Turbopack | Bukan. `next build --webpack` juga rusak |
| Versi React dan Next tidak cocok | Tidak terbukti. react 19.2.4, react-dom 19.2.4, next 16.1.6, semuanya sinkron dan dalam rentang peerDependencies |
| Dependensi berubah karena `npm install gsap lenis` | Bukan. Lockfile membuktikan versi react, react-dom, dan next tidak berubah |

## KOREKSI PENTING: pengukuran ini kemungkinan besar tidak sahih

Ditemukan setelah seluruh tabel di atas selesai dikumpulkan.

Browser yang dipakai untuk semua pengukuran melaporkan `document.hidden === true` dan
`document.visibilityState === "hidden"` sepanjang sesi. Panelnya memang tidak pernah
ditampilkan, sehingga halaman tidak meng-compose frame sama sekali.

React 19 memecah hidrasi menjadi beberapa potongan terjadwal. Pada tab tersembunyi,
penjadwalnya dapat tidak pernah melanjutkan potongan berikutnya. Itu menjelaskan seluruh
pola yang terlihat seperti ambang ukuran: halaman kecil selesai dalam potongan pertama,
halaman besar berhenti setelah cangkang layout.

Bukti tandingan yang menguatkan koreksi ini: tangkapan layar dari browser asli pengguna
menunjukkan kata berotasi di hero berganti dari "Pribadi" ke "Keluarga". Rotasi itu
digerakkan state React. Kalau halaman benar-benar tidak ter-hydrate, kata itu tidak akan
pernah berubah.

Pengujian di Chrome asli belum dapat dilakukan karena ekstensi Claude in Chrome tidak
terhubung di sesi ini.

**Kesimpulan sementara: bug ini belum terbukti ada.** Seluruh tabel di atas harus
diperlakukan sebagai data dari lingkungan ukur yang cacat, bukan sebagai bukti cacat
aplikasi. Yang harus dilakukan lebih dulu adalah verifikasi manual di browser biasa dengan
jendela terlihat, memakai cuplikan pengukuran di bagian akhir dokumen ini.

## Dugaan yang tersisa, bila bug ternyata memang nyata

Bug pada integrasi Next.js dan React di kombinasi versi ini, pada jalur streaming SSR
untuk payload di atas ukuran tertentu. Gejalanya cocok: boundary Suspense yang membungkus
halaman tidak pernah selesai di sisi klien, sehingga isi halaman tetap menjadi HTML server
yang mati, tanpa error apa pun.

Faktor risiko yang memperbesar kemungkinan ini: seluruh dependensi di `package.json`
dipatok `"latest"`, termasuk `react`, `react-dom`, dan `next`. Artinya kombinasi versi
dapat berubah kapan saja tanpa disengaja dan tidak dapat direproduksi.

## Langkah berikutnya yang disarankan

1. **Patok versi.** Ganti `"latest"` menjadi versi eksplisit untuk `react`, `react-dom`,
   dan `next`. Ini wajib dilakukan lebih dulu supaya masalahnya dapat direproduksi.
2. **Uji turun versi.** Coba `next` 16.0.x, atau `react` dan `react-dom` 19.1.x, lalu
   ulangi pengukuran node ter-hydrate pada halaman penuh.
3. **Laporkan ke hulu** bila reproduksi minimal berhasil. Repro-nya sederhana: satu
   halaman App Router dengan sekitar 200 node statis plus satu Client Component, di
   Next 16.1.6 dan React 19.2.4.

## Cara mengukur ulang

Jalankan build produksi lalu tempel ini di console browser:

```js
let hyd = 0
document.querySelectorAll("*").forEach((el) => {
  if (Object.keys(el).some((k) => k.startsWith("__react"))) hyd++
})
console.log(hyd, "dari", document.querySelectorAll("*").length)
```

Sehat berarti di atas 70 persen. Rusak berarti sekitar 10 persen dengan angka mutlak macet
di sekitar 27.
