import { errorResponse } from "@/lib/utils/api-response"

export async function POST() {
  return errorResponse(
    "Fitur analisis gambar dinonaktifkan setelah migrasi ke Cerebras. Gunakan chat teks untuk melanjutkan.",
    501
  )
}
