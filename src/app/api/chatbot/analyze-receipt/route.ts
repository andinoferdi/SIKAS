import { errorResponse } from "@/lib/utils/api-response"

export async function POST() {
  return errorResponse(
    "Fitur scan nota dinonaktifkan setelah migrasi ke Cerebras. Catat transaksi secara manual melalui chat teks atau form transaksi.",
    501
  )
}
