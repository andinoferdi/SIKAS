/*
  Menjalankan `next build` ke direktori terpisah, bukan `.next`.

  Tujuannya supaya pemeriksaan build tidak pernah menyentuh `.next` yang
  sedang dipakai `next dev`. Membangun ke folder yang sama akan menimpa dan
  menghapus manifest milik dev server, lalu memunculkan rentetan error
  ENOENT seperti `routes-manifest.json not found` di terminal dev.

  Dipakai lintas platform tanpa dependensi tambahan seperti cross-env.
*/
import { spawn } from "node:child_process"

const DIST_DIR = ".next-check"

const child = spawn("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: DIST_DIR },
})

child.on("exit", (code) => {
  if (code === 0) {
    console.log(`\nBuild bersih. Keluaran di ${DIST_DIR}, .next milik dev server tidak disentuh.`)
  }
  process.exit(code ?? 1)
})
