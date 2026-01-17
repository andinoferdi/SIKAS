import { z } from "zod"

export const createTransactionApiSchema = z.object({
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().optional(),
  payment_method: z.enum(["mbanking", "cash"]),
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
})

export type CreateTransactionApiInput = z.infer<typeof createTransactionApiSchema>
