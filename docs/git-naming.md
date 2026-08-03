# Naming, PR, dan Daily Report

Panduan singkat untuk nama branch, commit, PR title, deskripsi PR, dan daily report yang rapi dan konsisten dengan gaya tim `SIKAS`.

## Branch
- Format: `type/deskripsi-singkat-dengan-dash`. Untuk task personal: `andinoferdi/type/deskripsi-singkat`.
- Type umum: `fix`, `feat`, `feature`, `hotfix`, `refactor`, `chore`, `docs`, `test`.
- Huruf kecil dan dash, bukan spasi atau underscore.

```text
andinoferdi/fix/deskripsi-bug
andinoferdi/feat/nama-fitur
```

## Commit
- Conventional Commits: `type(domain): ringkasan perubahan`.
- `fix` untuk bug, `feat` untuk fitur baru, `refactor` untuk ubah struktur tanpa ubah behavior, `chore` untuk config/dependency, `docs` untuk dokumentasi, `test` untuk testing.
- Ringkasan boleh natural, tetap jelas mencakup perubahan utama.

```text
fix(domain): perbaiki flow yang bermasalah
feat(domain): tambah filter dan widget baru
```

Hindari commit terlalu umum: `fix bug`, `update`, `wip`, `tes`.

## PR Title
- Format tim: `[TARGET] source-branch : ringkasan perubahan`.
- Target biasanya `[STAGING]` untuk PR ke staging dan `[MAIN]` untuk PR ke main.
- Cek contoh PR terbaru agar format konsisten dengan tim.

```text
[STAGING] andinoferdi/fix/nama-fitur : ringkasan perubahan
[MAIN] andinoferdi/feat/nama-fitur : ringkasan perubahan
```

Untuk PR rebuild/remerge karena history target berubah, pakai kata `remerge` di ringkasan.

## PR Description
Singkat, natural, langsung menjelaskan perubahan utama. Tulis test yang benar-benar dijalankan. Jika tidak ada migration, tulis "Tidak ada migration".

```markdown
## Apa yang berubah?
[ringkasan perubahan]

## Kenapa perlu berubah?
[konteks masalah]

## Cara test
1. [langkah verifikasi]

## Checklist
- [x] Sudah di-test sesuai area perubahan
- [x] Tidak ada console error atau log tak perlu
- [x] Tidak ada hardcoded credential atau API key
- [x] Tidak ada migration, atau migration sudah dicek
```

## Laporan setelah PR
Kirim laporan singkat ke grup/reviewer/task tracker dengan title dan link PR.

```text
[STAGING] Ringkasan perubahan
[URL_PR]
```

## Daily Report
Minimal 3 item atau sesuai aturan tempat kerja. Bahasa singkat, humanize, langsung menjelaskan pekerjaan.

```text
1. Perbaiki flow modal edit
2. Perbaiki quantity yang masih 0
3. Tambah validasi duplicate saat edit
4. Tambah handling error validasi
```
