# Git Branch Tips

Tips praktis menjaga branch dan Pull Request tetap bersih di `SIKAS`, terutama saat harus resolve conflict ke `[STAGING_BRANCH]` yang sering di-remerge/reset. Panduan utama tetap `git-workflow.md` dan `git-naming.md`.

## 1. Mulai branch dari branch utama
Pakai `origin/main` sebagai titik mulai agar branch benar-benar dari remote terbaru.

```bash
git fetch origin --prune
git checkout -b andinoferdi/feat/nama-fitur origin/main
```

Local `main` boleh dipakai bila sudah dipastikan sama dengan remote:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b andinoferdi/feat/nama-fitur
```

Alasan mulai dari branch utama: branch lebih bersih, PR hanya berisi task sendiri, tidak membawa commit orang lain.

## 2. Meniru branch lain: jangan langsung merge
Untuk sekadar meniru behavior, lihat bedanya dulu, jangan merge branch orang ke branch kita.

```bash
git diff main..origin/nama-branch-lain -- path/relevan
git show origin/nama-branch-lain:path/ke/file      # lihat file tanpa pindah branch
```

Cherry-pick hanya untuk mem-port commit tertentu secara terkontrol. Setelah tahu behavior yang dibutuhkan, implementasikan di branch sendiri sesuai scope task.

## 3. Commit kecil, satu concern
Jangan tunggu semua selesai baru commit sekali. Commit kecil lebih mudah dicek, di-cherry-pick, dan resolve conflict.

```bash
git add path/service.ext
git commit -m "feat(domain): tambah flow utama"
git add path/test.ext
git commit -m "test(domain): tambah test flow utama"
```

## 4. Pola rebuild dari target branch
Kalau `[STAGING_BRANCH]` banyak remerge/reset dan merge langsung ke branch PR membuat diff membengkak (ikut membawa banyak commit orang lain), rebuild branch dari target lalu cherry-pick commit sendiri.

Diagnosis dulu sebelum mengubah history:

```bash
git fetch origin --prune
git rev-list --count origin/[STAGING_BRANCH]..HEAD
git diff --stat origin/[STAGING_BRANCH]...HEAD
git log --oneline origin/[STAGING_BRANCH]..HEAD
```

Jika diff terhadap `[STAGING_BRANCH]` besar dan banyak file non-task, rebuild:

```bash
git checkout -b andinoferdi/feat/nama-fitur-clean origin/[STAGING_BRANCH]
git cherry-pick <commit_task_1>
git cherry-pick <commit_task_2>
```

Kalau conflict muncul, resolve hanya di file area fitur. Pertahankan `origin/[STAGING_BRANCH]` sebagai baseline, tambahkan perubahan fitur di titik yang diperlukan. Jangan membawa route/service/migration milik task orang lain hanya karena ikut muncul. Jangan commit folder tool/cache untracked.

## 5. Verifikasi diff tetap fokus
Sebelum update branch PR:

```bash
git diff --stat origin/[STAGING_BRANCH]...HEAD
git diff --name-only origin/[STAGING_BRANCH]...HEAD
git diff --check
git log --oneline origin/[STAGING_BRANCH]..HEAD
```

Ekspektasi: file changed hanya area fitur, commit hanya commit sendiri, tidak ada whitespace error. Jalankan syntax check/targeted test sesuai area. Kalau diff membengkak, stop, biasanya ada commit asing atau base branch salah.

## 6. Update branch PR dengan aman
Gunakan `--force-with-lease`, bukan `--force` (Git menolak bila remote berubah tanpa sepengetahuan lokal).

```bash
git push --force-with-lease origin HEAD:andinoferdi/feat/nama-fitur
```

Setelah push: refresh PR, pastikan conflict hilang, `Files changed` fokus, commit hanya milik sendiri. Update remote PR hanya setelah yakin bersih dan ada izin eksplisit.

## 7. Sinkronkan local branch
```bash
git checkout andinoferdi/feat/nama-fitur
git fetch origin --prune
git pull --ff-only origin andinoferdi/feat/nama-fitur
```

Jika history berbeda karena remote sudah di-force-with-lease, samakan local ke remote hanya setelah working tree bersih:

```bash
git branch -f andinoferdi/feat/nama-fitur origin/andinoferdi/feat/nama-fitur
```

## 8. Warning
- Jangan `git push --force`. Pakai `--force-with-lease` dan hanya di branch sendiri.
- Jangan commit file environment, credential, API key, log, cache, atau perubahan debug.
- Jangan branch dari branch orang jika tidak ingin commit mereka ikut PR.
- Jangan merge `origin/[STAGING_BRANCH]` langsung ke branch PR bila tujuannya hanya menjaga diff PR tetap fokus saat staging sedang banyak remerge/reset.

## Referensi
- git cherry-pick: https://git-scm.com/docs/git-cherry-pick
- git push & --force-with-lease: https://git-scm.com/docs/git-push
- Resolve conflict via CLI: https://docs.github.com/articles/resolving-a-merge-conflict-using-the-command-line
