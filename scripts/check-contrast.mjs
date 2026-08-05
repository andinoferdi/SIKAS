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

/*
  Empat pasangan biru ditandai DITERIMA sejak 2026-08-05. Pengguna memilih
  biru cerah #0ea5e9 demi identitas merek, dengan sadar bahwa rasionya di
  bawah ambang WCAG AA. Skrip ini TIDAK menyembunyikan fakta itu: rasionya
  tetap dicetak dan diringkas di akhir. Yang dilakukan penandaan ini hanya
  membuat skrip tidak gagal pada keputusan yang memang disengaja, sehingga
  ia tetap berguna menjaga token lain dari regresi baru.

  Bila suatu saat biru dibuat lebih pekat lagi, hapus `true` di kolom
  terakhir supaya pasangan itu kembali menjadi gate yang keras.
*/

// [tokenDepan, tokenBelakang, ambang, keterangan, diterimaMeskiGagal?]
const CHECKS = [
  ["primary", "card", 4.5, "teks dan angka biru di atas kartu", true],
  ["primary", "background", 4.5, "teks biru di atas latar halaman", true],
  ["btn-primary-bg", "primary-foreground", 4.5, "teks putih di tombol utama", true],
  ["btn-primary-hover", "primary-foreground", 4.5, "teks putih di tombol utama saat hover", true],
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
  ["destructive", "card", 4.5, "teks error lewat kelas text-destructive"],
  ["destructive", "destructive-foreground", 4.5, "teks putih di tombol destructive"],
  // Ambang 2,5:1 disengaja. Token ini hanya untuk bidang besar tanpa teks
  // dan tanpa fungsi batas komponen, jadi ambang 3:1 tidak berlaku. Yang
  // dijaga di sini cuma agar nilainya tidak pernah dibuat lebih pucat lagi.
  ["primary-surface", "card", 2.5, "bidang dekoratif besar, bukan teks"],
]

let failed = 0
let accepted = 0

for (const [front, back, threshold, note, acceptedFailure] of CHECKS) {
  const ratio = contrast(readToken(front), readToken(back))
  const ok = ratio >= threshold

  let status
  if (ok) {
    status = "LOLOS   "
  } else if (acceptedFailure) {
    status = "DITERIMA"
    accepted += 1
  } else {
    status = "GAGAL   "
    failed += 1
  }

  console.log(
    `${status}  --${front} / --${back}  ${ratio.toFixed(2)}:1  (min ${threshold}:1)  ${note}`
  )
}

if (accepted > 0) {
  console.log(
    `\nCATATAN: ${accepted} pasangan berada DI BAWAH ambang WCAG AA dan diterima secara sadar.`
  )
  console.log(
    "Halaman ini tidak memenuhi WCAG AA untuk teks dan tombol berwarna biru."
  )
}

if (failed > 0) {
  console.error(`\n${failed} pasangan warna gagal memenuhi ambang WCAG.`)
  process.exit(1)
}

console.log(`\n${CHECKS.length - accepted} pasangan lolos, ${accepted} diterima meski gagal.`)
