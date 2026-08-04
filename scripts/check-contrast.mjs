// Pemeriksa kontras WCAG untuk token warna SIKAS.
// Membaca nilai langsung dari globals.css agar tidak bisa lolos karena
// daftar di sini lupa disinkronkan dengan CSS-nya.
import { readFileSync } from "node:fs"

const CSS = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8")

const readToken = (name) => {
  const match = CSS.match(new RegExp(`^\\s*--${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`, "m"))
  if (!match) {
    throw new Error(`Token --${name} tidak ditemukan di globals.css atau bukan hex 6 digit.`)
  }
  return match[1]
}

const toLinear = (channel) =>
  channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

const contrast = (a, b) => {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}

// [tokenDepan, tokenBelakang, ambang, keterangan]
const CHECKS = [
  ["primary", "card", 4.5, "teks dan angka biru di atas kartu"],
  ["primary", "background", 4.5, "teks biru di atas latar halaman"],
  ["btn-primary-bg", "primary-foreground", 4.5, "teks putih di tombol utama"],
  ["btn-primary-hover", "primary-foreground", 4.5, "teks putih di tombol utama saat hover"],
  ["text-muted", "card", 4.5, "teks sekunder di atas kartu"],
  ["text-muted", "background", 4.5, "teks sekunder di atas latar halaman"],
  // --muted-foreground yang sebenarnya dipakai komponen lewat kelas
  // text-muted-foreground. Tanpa baris ini, kelas yang paling sering
  // dipakai di seluruh aplikasi justru tidak pernah diperiksa.
  ["muted-foreground", "card", 4.5, "kelas text-muted-foreground di atas kartu"],
  ["muted-foreground", "background", 4.5, "kelas text-muted-foreground di atas latar"],
  ["success", "card", 4.5, "nominal pemasukan"],
  ["danger", "card", 4.5, "nominal pengeluaran dan pesan error"],
  ["foreground", "card", 4.5, "teks utama"],
  // Ambang 2,5:1 disengaja. Token ini hanya untuk bidang besar tanpa teks
  // dan tanpa fungsi batas komponen, jadi ambang 3:1 tidak berlaku. Yang
  // dijaga di sini cuma agar nilainya tidak pernah dibuat lebih pucat lagi.
  ["primary-surface", "card", 2.5, "bidang dekoratif besar, bukan teks"],
]

let failed = 0

for (const [front, back, threshold, note] of CHECKS) {
  const ratio = contrast(readToken(front), readToken(back))
  const ok = ratio >= threshold
  if (!ok) failed += 1
  const status = ok ? "LOLOS" : "GAGAL"
  console.log(
    `${status}  --${front} / --${back}  ${ratio.toFixed(2)}:1  (min ${threshold}:1)  ${note}`
  )
}

if (failed > 0) {
  console.error(`\n${failed} pasangan warna gagal memenuhi ambang WCAG.`)
  process.exit(1)
}

console.log(`\nSemua ${CHECKS.length} pasangan warna lolos.`)
