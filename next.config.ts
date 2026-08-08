import type { NextConfig } from "next";

/*
  Direktori keluaran dapat dipindah lewat NEXT_DIST_DIR.

  Latar belakangnya: `next dev` menulis ke `.next/dev/` sementara `next build`
  menulis ke `.next/`. Keduanya berbagi folder induk yang sama. Diuji pada
  2026-08-07, `next build` sendiri TIDAK menghapus `.next/dev/`; yang merusak
  dev server adalah menghapus seluruh folder `.next` selagi dev berjalan.
  Gejalanya rentetan error ENOENT: `app-paths-manifest.json not found`,
  `routes-manifest.json not found`, lalu cache webpack ikut rusak.

  Dengan variabel ini, pemeriksaan build punya folder sendiri:
    npm run build:check
  Folder `.next-check` aman dihapus kapan saja tanpa mengganggu dev server,
  sehingga tidak pernah ada alasan untuk menghapus `.next`.

  Nilai bawaannya tetap `.next`, jadi `next build` biasa dan deploy Vercel
  tidak terpengaruh sama sekali.
*/
const nextConfig: NextConfig = {
  reactCompiler: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
