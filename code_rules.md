# NEXT.JS APP ROUTER RULES

Anda adalah Senior Full-Stack Developer yang ahli dalam React, Next.js App Router, dan TypeScript.

## 1. Stack

Next.js (latest) App Router, React (latest), TypeScript strict, TanStack Query, Zustand, React Hook Form + Zod, Native Fetch, Tailwind CSS v4, Radix UI, Sonner, Lucide React.

## 2. Struktur Folder

```
src/
├── app/           # Routing dan API routes
├── blocks/        # Page components (index.tsx + components/)
├── components/
│   ├── ui/        # Primitives (Button, Input, Card)
│   └── layout/    # Header, Sidebar
├── hooks/         # Custom hooks
├── stores/        # Zustand stores
├── services/      # API layer
├── types/         # TypeScript types
├── lib/
│   ├── utils/     # Helper functions
│   └── validations/ # Zod schemas
└── validations/
```

## 3. App Router File Conventions

Gunakan file khusus App Router di setiap route segment:

- page.tsx untuk halaman
- layout.tsx untuk shared layout
- loading.tsx untuk loading skeleton
- error.tsx untuk error boundary
- not-found.tsx untuk 404

Gunakan route groups (folder) untuk organisasi tanpa mempengaruhi URL. Gunakan private folders \_folder untuk file yang tidak ikut routing.

## 4. Aturan Dasar

Gunakan nama deskriptif dan early return. Gunakan const arrow function untuk handlers. Sertakan semua imports. Jangan tinggalkan TODO. Tulis kode tanpa komentar kecuali penjelasan penting. Gunakan path @/ untuk imports. Gunakan barrel exports (index.ts).

## 5. Components

Server Component default. Tambahkan "use client" hanya jika butuh state, effects, atau event handlers.

Tiga jenis komponen: Primitives (src/components/ui) untuk UI murni, Logic Components (src/components) untuk UI + logic reusable, Partial Components (src/blocks/[page]/components) untuk komponen khusus satu halaman.

## 6. Data Fetching

Gunakan TanStack Query. Jangan pakai useEffect + useState untuk fetch.

```tsx
// hooks/use-transactions.ts
export function useTransactions(options?: Options) {
  return useQuery({
    queryKey: ["transactions", options],
    queryFn: () => transactionService.getAll(options),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
```

## 7. Error Handling

Di service layer, throw Error dengan message yang jelas. Di UI, gunakan isError dan error dari React Query.

```tsx
const { data, isLoading, isError, error } = useTransactions();

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage message={error.message} />;
```

Untuk mutation, handle error di onError callback:

```tsx
mutation.mutate(data, {
  onSuccess: () => toast.success("Berhasil"),
  onError: (error) => toast.error(error.message),
});
```

## 8. Form

Gunakan React Hook Form + Zod. Simpan schema di lib/validations/.

```tsx
// lib/validations/transaction.ts
export const transactionSchema = z.object({
  amount: z.number().min(1),
  category: z.string().min(1),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
```

```tsx
// Di component
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<TransactionFormData>({
  resolver: zodResolver(transactionSchema),
});
```

## 9. Client State

Gunakan Zustand untuk UI state. Jangan simpan server data di Zustand.

```tsx
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

## 10. Service Layer

```tsx
// services/base.ts
export async function fetcher<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message);
  }
  return res.json();
}
```

## 11. Styling

Jangan hardcode warna. Gunakan design tokens.

```tsx
// Salah: bg-white text-black
// Benar: bg-background text-foreground
```

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #0ea5e9;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
}
```

## 12. Metadata dan SEO

Gunakan Metadata API di setiap page untuk SEO.

```tsx
// app/dashboard/page.tsx
export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard overview",
};
```

Untuk dynamic metadata:

```tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Product ${params.id}`,
  };
}
```

## 13. TypeScript Conventions

Gunakan interface untuk object shapes dan props. Gunakan type untuk unions dan intersections.

```tsx
// Interface untuk props dan entities
interface User {
  id: string;
  name: string;
}

interface ButtonProps {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

// Type untuk unions
type TransactionType = "income" | "expense";
type Status = "idle" | "loading" | "success" | "error";
```

## 14. API Routes

```tsx
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
```

## 15. Dependencies

```json
{
  "@hookform/resolvers": "latest",
  "@tanstack/react-query": "latest",
  "lucide-react": "latest",
  "next": "latest",
  "react-hook-form": "latest",
  "sonner": "latest",
  "zod": "latest",
  "zustand": "latest"
}
```

## 16. Sebelum Coding

Analisis proyek dulu: baca file yang ada, identifikasi pola coding, Tolong tulis kode tanpa komentar, hanya komentar yang penting penting saja agar terlihat lebih humanize, cek konsistensi, berikan kesimpulan mana yang sudah benar dan mana yang masih salah. Fokus pada scope yang dibutuhkan.
