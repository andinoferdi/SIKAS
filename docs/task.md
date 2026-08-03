# Task

## Guide
- Ikuti `git-workflow.md`: mulai dari `main`, pull perubahan terbaru, lalu buat branch baru sesuai `git-naming.md`.
- Kerjakan task di branch tersebut. Setelah selesai dan diverifikasi, add, commit, push, lalu buat PR ke branch tujuan.
- Nama branch, commit, PR title, dan deskripsi wajib mengikuti `git-naming.md` dan `git-workflow.md`.
- Task ini didemokan oleh `[ROLE_DEMO]` pada environment `[URL_ENVIRONMENT_DEMO]`.
- Demo mungkin memakai kombinasi branch `[BRANCH_DEMO_1]` dan `[BRANCH_DEMO_2]`.
- Jika branch utama, staging, dan demo tidak sinkron: mulai dari branch utama sesuai workflow, audit perbedaannya, lalu ambil perubahan relevan secara selektif. Jangan langsung mengubah workflow.
- Untuk memahami flow, lihat dokumen atau diagram di `[PATH_FLOW_DIAGRAM]`.

## Kredensial
- Web local: username `[LOCAL_USERNAME]`, password `[LOCAL_PASSWORD]`.
- Web staging/demo: url `[STAGING_URL]`, username `[STAGING_USERNAME]`, password `[STAGING_PASSWORD]`.

> Kredensial hanya untuk testing sesuai izin. Jangan commit ke repo, dokumentasi, screenshot, log, atau PR.

## Konteks
Inti fitur ini adalah `[JELASKAN_RINGKAS_KONTEKS_FITUR]`.

Contoh kasus:
- `[CONTOH_KASUS_1]`
- `[CONTOH_KASUS_2]`

## Subtask Utama
Di `[NAMA_MODUL_UTAMA]`:

- [ ] 1. `[SUBTASK_1]`
  - File/area terkait: `[PATH_FILE_TERKAIT]`
  - Ekspektasi: `[HASIL_YANG_DIHARAPKAN]`

- [ ] 2. `[SUBTASK_2]`
  - Kondisi bug saat ini: `[JELASKAN_BUG]`
  - Ekspektasi: `[HASIL_YANG_DIHARAPKAN]`

- [ ] 3. `[SUBTASK_3]`
  - Tujuan: `[TUJUAN_PERUBAHAN]`
  - Data yang dibutuhkan: `[FIELD_ATAU_DATA]`
  - Referensi internal: `[PATH_REFERENSI]`
  - Catatan integrasi: jika perlu payload baru, tentukan field yang aman, backward compatible, dan jelas untuk kedua sisi. Jika tidak, jelaskan sumber data yang dipakai.

## Sebelum Eksekusi
Akses environment staging/demo secara read-only menggunakan browser MCP, Playwright, browser harness, atau tool hemat token lain.

- Buka `[STAGING_URL]`. Login hanya jika perlu untuk melihat flow.
- Jangan create, update, delete, submit, approve, sync, import, export, atau action apa pun yang mengubah data staging/demo.
- Amati flow UI dan perilaku backend yang relevan. Bandingkan dengan local.
- Lihat referensi kode branch staging/demo secara read-only, ambil hanya bagian relevan. Jangan menyalin buta.

## Audit
- Mulai dari branch utama jika itu aturan resmi. PR wajib diarahkan ke `main`.
- Jika environment demo memakai branch berbeda dari target PR, jangan langsung menyimpulkan target PR salah. Audit perbedaan `main`, `main`, dan `[BRANCH_DEMO]` dulu.
- Jika staging/demo lebih maju, ambil perubahan relevan dengan cara paling aman sesuai `git-branch-tips.md`.
- Hasil akhir harus tetap bisa naik ke PR `main` tanpa merusak workflow, history, atau flow bisnis.
- Catat asumsi branch dan alasan teknis bila ada keputusan yang berpotensi membingungkan reviewer.

## Eksekusi
- Boleh melihat UI, flow, response, dan perilaku fitur. Tidak boleh mengubah data staging/demo tanpa izin eksplisit.
- Setelah mengubah kode, jangan add/commit/push sebelum diminta.
- Ini project besar: jangan ubah bagian kritikal tanpa kebutuhan task jelas. Ikuti pola kode yang ada, hindari refactor besar tak diminta.
- Jalankan verifikasi relevan (test, lint, build, cek manual) sesuai area perubahan.
- Setelah selesai, laporkan: file yang diubah, ringkasan perubahan, hasil verifikasi, dan risiko/catatan.

## Kredensial Tambahan (opsional)
- Web/API tambahan: url `[ADDITIONAL_URL]`, username `[ADDITIONAL_USERNAME]`, password `[ADDITIONAL_PASSWORD]`.

> Isi hanya jika task butuh environment tambahan seperti sistem integrasi, dashboard admin, atau sandbox service eksternal.
