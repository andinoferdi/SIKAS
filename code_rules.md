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
├── hooks/         # Global/shared hooks (TanStack Query wrappers)
├── stores/        # Zustand stores
├── services/      # API layer
├── types/         # TypeScript types
├── lib/
│   ├── utils/     # Helper functions
│   └── validations/ # Zod schemas
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

Gunakan nama deskriptif dan early return. Gunakan const arrow function untuk handlers. Sertakan semua imports. Jangan tinggalkan TODO. Tulis kode tanpa komentar kecuali penjelasan penting. **Selalu gunakan absolute path `@/` untuk semua imports, termasuk di barrel exports (index.ts). Jangan pernah gunakan relative path (`./` atau `../`).**

## 5. Components

Server Component default. Tambahkan "use client" hanya jika butuh state, effects, atau event handlers.

Tiga jenis komponen: Primitives (src/components/ui) untuk UI murni, Logic Components (src/components) untuk UI + logic reusable, Partial Components (src/blocks/[page]/components) untuk komponen khusus satu halaman.

**Component Size Limit:** Maksimal ~150-200 lines per component. Jika lebih, split menjadi sub-components.

## 6. Hooks Location

```
src/hooks/                    # Global hooks (TanStack Query wrappers, auth)
src/components/*/hooks/       # Feature-specific hooks (chatbot, etc)
src/blocks/*/components/hooks/ # Page-specific hooks (transaction form, etc)
```

Aturan: Jika hook dipakai di lebih dari 1 fitur → `src/hooks/`. Jika hanya untuk 1 fitur → co-locate dengan komponennya.

## 7. Data Fetching

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

## 8. Error Handling

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

## 9. Form

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

## 10. Client State

Gunakan Zustand untuk UI state. Jangan simpan server data di Zustand.

```tsx
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

## 11. Service Layer

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

## 12. Styling

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

## 13. Metadata dan SEO

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

## 14. TypeScript Conventions

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

## 15. API Routes

```tsx
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
```

## 16. Dependencies

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

## 17. Sebelum Coding

Analisis proyek dulu: baca file yang ada, identifikasi pola coding, Tolong tulis kode tanpa komentar, hanya komentar yang penting penting saja agar terlihat lebih humanize, cek konsistensi, berikan kesimpulan mana yang sudah benar dan mana yang masih salah. Fokus pada scope yang dibutuhkan.
