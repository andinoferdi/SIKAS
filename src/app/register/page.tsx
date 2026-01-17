import type { Metadata } from "next"
import RegisterPage from "@/blocks/register"

export const metadata: Metadata = {
  title: "Daftar - SIKAS",
  description: "Buat akun SIKAS baru untuk mulai mengelola keuangan Anda.",
}

export default function Page() {
  return <RegisterPage />
}
