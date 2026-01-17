import { z } from "zod"

export const transactionFormSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Jumlah wajib diisi"),
  category: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().optional(),
  payment_method: z.enum(["cash", "mbanking"]),
  transaction_date: z.string().min(1, "Tanggal wajib diisi"),
})

export type TransactionFormData = z.infer<typeof transactionFormSchema>
