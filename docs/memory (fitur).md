# Memory Fitur: [NAMA_FITUR]

Sumber konteks utama untuk melanjutkan fitur `[NAMA_FITUR]` pada sesi AI baru. Baca dokumen ini dulu, periksa kondisi repo terbaru, lalu lanjutkan implementasi. Jangan menanyakan ulang keputusan bertanda **FINAL**. Tanya hanya jika ada requirement baru, keputusan stakeholder terbaru, atau kontradiksi baru yang mengubah implementasi.

## Status Saat Memory Dibuat
- Repo: `andinoferdi/SIKAS` | Path lokal: `c:\Users\Lenovo\Downloads\SIKAS`.
- Branch aktif: `[BRANCH_AKTIF]` | Target PR: `main` | URL PR: `[URL_PR]`.
- Status remote: `[SUDAH_DIPUSH / BELUM_DIPUSH / BELUM_ADA_REMOTE]`.
- Status conflict: `[TIDAK_ADA / ADA / SUDAH_DIRESOLVE]` | Strategi terakhir: `[MERGE / REBASE / CHERRY_PICK / REBUILD / BELUM_PERNAH]`.
- Scope: `[MODUL_YANG_DIKERJAKAN]`.
- Commit penting terakhir: `[SHA] [MESSAGE]`.
- Verifikasi terakhir: `[RINGKASAN]`.
- Batasan: `[MIS. TIDAK_PUSH / TIDAK_UBAH_SCHEMA / TIDAK_BUAT_UI]`.

## Tujuan Fitur - FINAL
`[NAMA_FITUR]` bertujuan `[TUJUAN_1_PARAGRAF]`.

Masalah yang diselesaikan: `[MASALAH_1]`, `[MASALAH_2]`, `[MASALAH_3]`.

Pembagian tanggung jawab: `[SISTEM_A]` -> `[TANGGUNG_JAWAB_A]`; `[SISTEM_B]` -> `[TANGGUNG_JAWAB_B]`.

## Kontrak API / Interface - FINAL
Kunci kontrak yang tidak boleh berubah tanpa keputusan baru.

```text
[METHOD_ATAU_COMMAND] [PATH_ATAU_INTERFACE]
Middleware/auth/permission: [NAMA]
```

Aturan input: `[FIELD]`: `[VALIDASI_ATAU_BUSINESS_RULE]`.

Status/exit code penting: `[KODE_SUKSES]`, `[KODE_VALIDASI]`, `[KODE_AUTH]`, `[KODE_NOT_FOUND]`, `[KODE_CONFLICT]`, `[KODE_ERROR]` beserta maknanya.

## Flow Implementasi - FINAL
Saat data belum tersedia: `[LANGKAH_1]` -> `[LANGKAH_2]` -> `[LANGKAH_3]`.

Saat data sudah ada / request diulang (idempotent): `[LANGKAH_1]` -> `[LANGKAH_2]`.

Aturan transaksi, locking, dan pencegahan duplikasi: `[UNIQUE_CONSTRAINT / LOCKING / TRANSACTION / IDEMPOTENCY]`.

## Aturan Bisnis - FINAL
- `[BUSINESS_RULE_1]`
- `[BUSINESS_RULE_2]`
- `[BUSINESS_RULE_3]`

Informasi lama yang **SUDAH TIDAK BERLAKU**: `[KEPUTUSAN_LAMA]` karena `[ALASAN_TERBARU]`.

## Metadata Teknis - FINAL
- Lokasi metadata: `[TABEL / FILE / CACHE_KEY / MODEL]`. Alasan: `[KEPUTUSAN_ARSITEKTUR]`.
- Field penting: `[FIELD]`: `[FUNGSI]`.
- Jangan menghapus atau memindahkan lokasi metadata tanpa keputusan arsitektur/stakeholder baru.

## Logging & Observability - FINAL
Wajib ada: `[EVENT_LOG]`: `[KONTEKS_AMAN]`.

Jangan log: authorization header, API token, credential, isi environment, private key, payload besar tak perlu, atau data sensitif user di luar kebutuhan investigasi.

## Peta Implementasi
- `[PATH_FILE_1]`: `[TANGGUNG_JAWAB_1]`
- `[PATH_FILE_2]`: `[TANGGUNG_JAWAB_2]`
- `[PATH_TEST]`: `[CAKUPAN_TEST]`

Config/command penting:
```text
[NAMA_CONFIG]=[NILAI_FINAL]
[COMMAND_VERIFIKASI]
```

## Keputusan yang Jangan Diubah Ulang
- `[KEPUTUSAN_FINAL_1]`
- `[KEPUTUSAN_FINAL_2]`
- Jangan push tanpa permintaan pengguna.
- Jangan mengubah scope di luar `[SCOPE_FINAL]` tanpa instruksi baru.

## Verifikasi Terakhir
- `[COMMAND_ATAU_TEST]`: `[HASIL]`.
- Belum bisa dijalankan: `[COMMAND]` karena `[ALASAN]`. Jangan anggap kegagalan environment sebagai kegagalan business logic sebelum diverifikasi ulang.

## Checklist Sesi Berikutnya
1. Baca dokumen ini sebelum file lain.
2. Periksa `git status` pada repo `andinoferdi/SIKAS`.
3. Jangan membuat ulang fitur yang sudah ada.
4. Cocokkan perubahan baru dengan keputusan **FINAL**.
5. Prioritaskan keputusan terbaru `[NAMA_STAKEHOLDER]` bila ada.
6. Jalankan targeted test dulu sebelum regression lebih luas.
7. Jangan push tanpa permintaan pengguna.
8. Jika PR conflict lagi, audit diff dulu dan gunakan strategi paling aman sesuai `git-branch-tips.md`.

## Urutan Sumber Kebenaran
1. Jawaban terbaru `[STAKEHOLDER_BISNIS]` soal business rule.
2. Jawaban terbaru `[STAKEHOLDER_TEKNIS]` soal arsitektur dan lokasi metadata.
3. Task/requirement terbaru: `[PATH_REQUIREMENT]`.
4. Implementasi dan test pada branch `[BRANCH_AKTIF]`.
5. Chat/catatan lama hanya konteks historis, bukan keputusan final kecuali dikonfirmasi ulang.
