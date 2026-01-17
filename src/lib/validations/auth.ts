import { z } from "zod"

export const loginSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  pin: z.string().min(4, "PIN minimal 4 digit").max(6, "PIN maksimal 6 digit"),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter").regex(/^[a-zA-Z\s]+$/, "Nama hanya boleh huruf dan spasi"),
    pin: z.string().min(4, "PIN minimal 4 digit").max(6, "PIN maksimal 6 digit").regex(/^\d+$/, "PIN hanya boleh angka"),
    confirmPin: z.string(),
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PIN tidak sama",
    path: ["confirmPin"],
  })

export type RegisterFormData = z.infer<typeof registerSchema>
