<!-- BEGIN:project-context -->
# SIKAS

Stack: `Next.js Route Handlers (TypeScript)` + `Next.js App Router + React + Tailwind CSS` + `Supabase Postgres`. Modul utama: auth (PIN + session JWT), transactions, categories, summary/dashboard, dan chatbot RAG. Baca file tree dulu, struktur nyata repo adalah sumber kebenaran. Jangan tambah framework/library baru jika stack atau helper project sudah cukup. Abaikan `node_modules`, `vendor`, `dist`, `build`, `.next`, `coverage`, log dan asset besar.
<!-- END:project-context -->

<!-- BEGIN:coding-rules -->
# Coding rules

Perubahan minimal dan spesifik pada task. Pahami file terdekat, route/endpoint terkait, dan pola modul sebelum mengubah kode. Jangan rombak arsitektur atau redesign UI tanpa instruksi eksplisit.

- Jaga route, method, middleware, permission, dan kontrak request/response yang sudah berjalan.
- Validasi input di server. Jangan percaya role, harga, stok, status, atau ownership dari client.
- Logic berat ikut pola layer yang ada, bukan menumpuk di controller/handler.
- Hindari N+1 pada listing, tabel, export, dan dashboard.
- Jangan hardcode secret, credential, URL production, token, atau API key.
<!-- END:coding-rules -->

<!-- BEGIN:commands -->
# Commands

Jika RTK tersedia, awali shell command dengan `rtk`.

```powershell
rtk npm run dev
rtk npm run build
rtk npm run lint
```

Jalankan hanya command yang relevan dengan task. Verifikasi sesuai area perubahan: test untuk logic backend, build untuk asset frontend, cek manual untuk UI. Jika verifikasi tidak bisa jalan karena environment, catat alasannya di final response. Jangan jalankan command berat (full build, full test, migration nyata, deploy) tanpa kebutuhan task.
<!-- END:commands -->

<!-- BEGIN:safety -->
# Safety

- Jangan commit, push, deploy, atau menjalankan migration nyata tanpa instruksi eksplisit.
- Jangan mengubah migration lama, dump SQL, seed penting, atau data production.
- Jangan menghapus permission, middleware, filter akses, atau validasi demi menyederhanakan kode.
- Jangan mengubah file environment kecuali diminta.
- Ada perubahan user di worktree yang bukan buatan Anda: jangan revert, bekerja berdampingan.
<!-- END:safety -->

<!-- BEGIN:related-docs -->
# Related docs

Ikuti bersama `chat-rules.md`, `code-rules.md`, dan `token.md`. Detail teknis: `be-rules.md`, `fe-rules.md`. Git: `git-workflow.md`, `git-naming.md`, `git-branch-tips.md`. Konflik aturan: instruksi sistem/platform > instruksi user terbaru > dokumen ini.
<!-- END:related-docs -->

<!-- Block di bawah ini milik tool/framework (auto-generated). Jangan edit manual, biarkan tool yang update. Contoh: -->

<!-- BEGIN:nextjs-agent-rules -->
<!-- Terisi otomatis oleh Next.js bila project memakainya. Hapus placeholder ini jika tidak relevan. -->
<!-- END:nextjs-agent-rules -->
