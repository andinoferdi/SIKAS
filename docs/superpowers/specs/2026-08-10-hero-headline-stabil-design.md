# Hero Headline Stabil - Design Spec

Tanggal: 2026-08-10
Branch: `andinoferdi/feat/dashboard-redesign`
Status: disetujui, siap dikerjakan

## Masalah

Judul hero berbunyi "Kelola keuangan untuk [kata berputar]" dengan lima kata yang berganti tiap
3 detik. Ketika kata yang tampil panjang, jumlah baris judul bertambah, tinggi `h1` ikut
bertambah, dan seluruh konten di bawahnya (paragraf, tombol, strip kepercayaan) terdorong ke
bawah. Pergeseran ini berulang selama halaman terbuka.

## Pengukuran

Viewport 1280px, kolom judul 512px, font 80px, tinggi baris 84px:

| Kata | Lebar "untuk" + kata | Hasil |
| --- | --- | --- |
| Bisnis | 439px | 2 baris |
| Semua | 474px | 2 baris |
| Pribadi | 477px | 2 baris |
| Keluarga | 547px | 3 baris |
| Masa Depan | 679px | 3 baris |

Dua dari lima kata memicu lompatan setinggi 84px.

Lebar teks pada beberapa ukuran font, kolom 512px:

| Font | "Kelola keuangan" | "untuk Masa Depan" | "Masa Depan" |
| --- | --- | --- | --- |
| 80px | 615 (tidak muat) | 696 (tidak muat) | 464 (muat) |
| 64px | 486 (muat) | 551 (tidak muat) | 367 (muat) |
| 56px | 421 (muat) | 478 (muat) | 319 (muat) |

## Akar masalah

Bukan panjang katanya, melainkan skala fontnya. Token `--text-display` bernilai
`clamp(2.5rem, 8vw, 5rem)`, dan faktor `8vw` itu ukuran untuk teks selebar halaman. Dari
breakpoint `lg` ke atas layout hero berubah jadi dua kolom, kolom judul menyusut ke 448px
(pada 1024px) sampai 512px (pada 1216px ke atas), sementara font tetap mentok di 80px.

Pada 80px bahkan "Kelola keuangan" sendiri sudah 615px, melebihi kolom. Judulnya memang tidak
pernah muat sejak awal; hal itu hanya tidak terlihat ketika kata yang kebetulan tampil pendek.

## Keputusan desain

### 1. Token baru `--text-display-split`

```css
--text-display-split: clamp(3.5rem, 5.5vw, 4.1875rem);
```

Batas bawah 56px agar aman di kolom tersempit (448px pada viewport 1024px), batas atas 67px
agar aman di kolom 512px. Dipakai hanya dari `lg` ke atas, yaitu saat layout menjadi dua kolom.

`--text-display` yang lama tidak diubah sama sekali, sehingga pemakaian di tempat lain dan
tampilan mobile serta tablet tidak terpengaruh.

### 2. Struktur judul dikunci tiga baris

```
Kelola keuangan
untuk
[kata berputar]
```

Baris dipisah dengan `<br>` eksplisit, dan kata berputar dibungkus `whitespace-nowrap` agar
tidak pernah pecah sendiri. Jumlah baris menjadi tetap berapa pun panjang katanya, sehingga
kata baru yang ditambahkan di kemudian hari otomatis aman.

Alternatif dua baris ("untuk Masa Depan" pada satu baris) ditolak: alternatif itu menuntut font
turun sampai sekitar 52px agar aman di seluruh rentang `lg`, sedangkan struktur tiga baris
cukup pada sekitar 59px. Struktur tiga baris mempertahankan judul lebih besar sekaligus stabil.

### 3. Daftar kata tidak diubah

Kelima kata dipertahankan, termasuk "Masa Depan". Perbaikan bersifat struktural, jadi tata
letak dibuat tahan terhadap konten, bukan konten yang dipaksa menyesuaikan tata letak rapuh.
Memendekkan kata hanya memindahkan kerapuhan ke kemudian hari. "Masa Depan" juga menyambung ke
kalimat pendukung di bawahnya yang berbunyi "untuk masa depan yang lebih baik".

## Batasan

- Animasi rotasi kata yang sudah ada tidak diubah, termasuk penghormatannya terhadap
  `prefers-reduced-motion`.
- Blok ringkasan angka di kolom kanan dan perilaku pin GSAP-nya tidak disentuh.
- Tidak ada perubahan copy.

## Verifikasi

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build:check`
4. Browser: ukur tinggi `h1` untuk kelima kata pada 1024px, 1280px, dan 1920px. Tinggi harus
   identik untuk semua kata di tiap viewport.
5. Browser: pastikan tidak ada overflow horizontal dan hero tetap muat di viewport awal.

## Kriteria selesai

- Tinggi `h1` identik untuk kelima kata pada seluruh viewport yang diuji.
- Tidak ada baris judul yang melebihi lebar kolomnya.
- Mobile dan tablet tidak berubah perilakunya selain penguncian jumlah baris.
- Menambah kata baru yang lebih panjang tidak mengubah tinggi judul.
