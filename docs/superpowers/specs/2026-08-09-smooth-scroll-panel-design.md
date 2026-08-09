# Smooth Scroll pada Container Bersarang - Design Spec

Tanggal: 2026-08-09
Branch: `andinoferdi/feat/dashboard-redesign`
Status: disetujui, siap dikerjakan
Acuan: `C:\Users\Lenovo\Downloads\andinoferdi-portfolio`

## Tujuan

Seluruh area yang bisa digulir memakai smooth scroll Lenis, baik halaman maupun container
bersarang seperti modal, panel chatbot, dan dropdown. Keputusan pengguna: semua halaman dan
semua container wajib smooth.

## Latar

Commit `bd089e9` mengembalikan scroll roda pada sepuluh container dengan dua cara: memasang
`data-lenis-prevent` pada tiap container, dan menambah pemeriksaan otomatis di root Lenis yang
melepas elemen mana pun yang bisa digulir sendiri. Keduanya mengembalikan scroll native, bukan
smooth. Commit itu juga membatasi Lenis ke halaman publik saja.

Spec ini mengubah dua hal dari commit tersebut:

1. Pembatasan Lenis ke halaman publik dicabut. Dashboard kembali memakai Lenis.
2. Container tidak lagi sekadar dilepas ke scroll native, tapi diberi instance Lenis bersarang.

## Temuan dari project acuan

Portfolio memakai tiga strategi berbeda, bukan satu:

| Strategi | Berkas acuan | Kapan dipakai |
| --- | --- | --- |
| `useLenisPanel` (Lenis bersarang) | `src/hooks/useLenisPanel.ts` | panel yang harus ikut smooth |
| `useLenisPreventOnOverflow` | `src/hooks/useLenisPreventOnOverflow.ts` | scroll native, atribut dipasang hanya saat benar-benar overflow |
| `data-lenis-prevent` statis | `src/components/audio/QueueList.tsx` | scroll native pada container yang pasti overflow |

Root `LenisProvider` portfolio **tidak** memakai opsi `prevent` sama sekali. Pengecualian
diatur per container, bukan terpusat.

Catatan penting dari komentar `useLenisPreventOnOverflow`: memasang `data-lenis-prevent` saat
elemen tidak overflow membekukan halaman, karena Lenis menelan roda sementara elemennya tidak
punya apa pun untuk digulir dan `overscroll-behavior: contain` memblokir penerusan.

Sudah diverifikasi di SIKAS bahwa pembekuan itu **tidak** terjadi sekarang: aturan CSS di
`globals.css` menargetkan `.lenis.lenis-smooth`, sedangkan html hanya pernah memakai kelas
`lenis` dan `lenis-scrolling`, sehingga `overscroll-behavior` tetap `auto` dan guliran tetap
diteruskan ke halaman. Marginnya tipis dan bergantung pada kebetulan, jadi spec ini
menghapus ketergantungan itu dengan memberi container instance Lenis sendiri.

## Keputusan desain

### 1. Hook baru: `src/components/scroll/use-lenis-panel.ts`

Ditempatkan bersama `lenis-provider.tsx` agar urusan scroll terkumpul di satu modul, bukan di
`src/hooks/` yang berisi hook data React Query.

Membuat instance Lenis bersarang dengan `wrapper` dan `content` menunjuk elemen itu sendiri.
Dua bagian yang dibawa utuh dari acuan:

- `naiveDimensions: true` membaca `scrollHeight` secara live, sehingga panel yang isinya tumbuh
  (chat streaming, hasil pencarian yang berubah) tidak bekerja dengan batas gulir basi.
- Serah terima di tepi. Lenis menandai `lenisStopPropagation` dari posisi teranimasi, sehingga
  selama panel masih meluncur menuju tepi ia terus menelan roda dan halaman terasa tertahan.
  Niat pengguna ada di `targetScroll`, jadi begitu target menyentuh tepi pada arah roda, tanda
  itu dibersihkan agar Lenis root langsung mengambil alih.

Menerima `deps` untuk panel yang mount bersyarat seperti dropdown dan modal.

Tidak membuat instance sama sekali saat `prefers-reduced-motion: reduce`, sehingga scroll
native tetap utuh. Ini menjaga perilaku yang sudah ada di root provider.

### 2. Root provider

- Pembatasan `pathname.startsWith("/dashboard")` dicabut.
- Efek reset posisi scroll tetap terpisah dan tetap jalan sekali saat mount.
- Pemeriksaan `prevent` dipertahankan tapi dibuat sadar panel:
  - elemen bertanda panel dikembalikan `false`, supaya instance bersarang yang menangani dan
    root tetap menerima event saat serah terima di tepi terjadi;
  - elemen yang bisa digulir sendiri tapi tanpa hook tetap dikembalikan `true`, sebagai jaring
    pengaman agar container baru minimal bisa digulir secara native.

### 3. Penerapan ke container

Sepuluh container menerima hook, dan `data-lenis-prevent` statis dicabut dari container yang
menerima hook karena atribut itu justru menghalangi serah terima:

| Berkas | Container |
| --- | --- |
| `chatbot/chat-messages.tsx` | daftar pesan |
| `chatbot/batch-action-confirmation.tsx` | dua daftar konfirmasi |
| `chatbot/chat-message.tsx` | isi pesan panjang |
| `chatbot/model-selector.tsx` | dropdown model |
| `layout/header-search.tsx` | hasil pencarian |
| `layout/mobile-search-modal.tsx` | hasil pencarian mobile |
| `dashboard/components/edit-transaction-modal.tsx` | badan modal |
| `ui/select.tsx` | viewport dropdown |

### 4. Risiko yang diketahui

Modal edit transaksi dan dropdown `Select` memakai portal Radix, dan viewport `Select` punya
perilaku scroll internal sendiri. Keduanya wajib diverifikasi langsung di browser. Bila Lenis
bersarang berkelahi dengan mekanisme Radix, kedua komponen itu dikembalikan ke scroll native
dan hasilnya dilaporkan, bukan dipaksakan.

## Verifikasi

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build:check`
4. Browser: pastikan panel bergulir halus, serah terima ke halaman terjadi begitu panel mentok,
   halaman dashboard kembali smooth, dan dropdown Radix tetap berfungsi normal.

## Kriteria selesai

- Semua container pada tabel di atas bergulir halus dengan roda mouse.
- Halaman mentok di panel tidak membuat guliran halaman tertahan.
- Tidak ada container yang membekukan halaman saat isinya kosong atau pendek.
- `prefers-reduced-motion` tetap mematikan seluruh smoothing.
