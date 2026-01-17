# NEXT JS APP ROUTER RULES

Anda adalah Senior Full-Stack Developer yang ahli dalam React, Next.js App Router, TypeScript, dan modern web development.

## Stack Teknologi

- Next.js (latest) dengan App Router
- React (latest)
- TypeScript strict mode
- TanStack Query (React Query) untuk server state
- Zustand untuk client state
- React Hook Form + Zod untuk form dan validasi
- Native Fetch API untuk HTTP requests
- Tailwind CSS v4
- Radix UI untuk primitives
- Sonner untuk toast
- lucide-react untuk icons

## Struktur Folder

```
src/
├── app/                   # App Router (routing dan API routes)
├── blocks/                # Page-level components
│   └── [page]/
│       ├── index.tsx
│       └── components/    # Partial components untuk page ini
├── components/
│   ├── ui/                # Primitives (Button, Input, Card)
│   └── layout/            # Layout components (Header, Sidebar)
├── hooks/                 # Custom hooks reusable
├── stores/                # Zustand stores
├── services/              # API layer
├── types/                 # TypeScript types
└── lib/                   # Utilities dan helpers
```

## Aturan Coding

Gunakan nama deskriptif. Gunakan early return. Gunakan const arrow function untuk handlers. Sertakan semua imports. Jangan tinggalkan TODO atau placeholder. Tulis kode tanpa komentar kecuali penjelasan penting. Gunakan path absolut @/ untuk imports.

## Component Architecture

Komponen dibagi menjadi tiga jenis:

**1. Komponen Primitif (src/components/ui)**

- Berisi kode UI murni tanpa business logic
- Reusable di semua halaman
- Contoh: Button, Input, Card, Select, Tabs

```tsx
// components/ui/button.tsx
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-colors",
        variant === "primary" && "bg-primary text-primary-foreground",
        className,
      )}
      {...props}
    />
  );
}
```

**2. Komponen Logika (src/components)**

- Mengimpor komponen UI dan menambahkan logika
- Reusable di semua halaman
- Contoh: DataTable, SearchBar, Modal dengan logic

```tsx
// components/search-bar.tsx
"use client";
import { useState } from "react";
import { Input } from "@/components/ui";

export function SearchBar({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = useState("");

  const handleSearch = (value: string) => {
    setQuery(value);
    onSearch(value);
  };

  return <Input value={query} onChange={(e) => handleSearch(e.target.value)} />;
}
```

**3. Komponen Partial (src/blocks/[page]/components)**

- Hanya dipakai pada satu halaman spesifik
- Tidak reusable
- Contoh: DashboardStats, ProfileHeader

```tsx
// blocks/dashboard/components/dashboard-stats.tsx
export function DashboardStats({ income, expense }: StatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>Income: {income}</Card>
      <Card>Expense: {expense}</Card>
    </div>
  );
}
```

## Styling Guidelines

**Jangan hardcode warna.** Ambil semua warna dari design tokens di globals.css.

**❌ Salah:**

```tsx
<div className="bg-white text-black border-gray-200">
<button className="bg-blue-500 text-white">
```

**✅ Benar:**

```tsx
<div className="bg-background text-foreground border-border">
<button className="bg-primary text-primary-foreground">
```

Definisikan semua warna di globals.css:

```css
:root {
  --background: #ffffff;
  --foreground: #0f172a;
  --primary: #0ea5e9;
  --primary-foreground: #ffffff;
  --muted: #f1f5f9;
  --border: #e2e8f0;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-border: var(--border);
}
```

## Project Study Instructions

Sebelum memulai coding, Anda WAJIB melakukan analisis proyek:

1. **Baca semua file** di src/app, src/blocks, src/components, src/services
2. **Analisis struktur** folder yang sudah ada
3. **Identifikasi pola** coding yang sudah digunakan
4. **Cek konsistensi** naming, struktur component, dan styling
5. **Buat rangkuman** bagian yang sudah sesuai dan yang belum konsisten

Fokus pada scope yang dibutuhkan saja. Jangan tambahkan folder atau fitur yang tidak perlu.

Tulis kode tanpa komentar, hanya komentar penting saja agar terlihat natural.

## Server vs Client Components

Server Component adalah default. Tambahkan "use client" hanya jika butuh state, effects, event handlers, atau browser APIs.

## Data Fetching dengan React Query

Gunakan React Query untuk semua client-side data fetching. Jangan pakai useEffect + useState untuk fetch data.

```tsx
// hooks/use-transactions.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "@/services";

export function useTransactions(options?: { month?: string; year?: string }) {
  return useQuery({
    queryKey: ["transactions", options],
    queryFn: () => transactionService.getAll(options),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
```

```tsx
// Penggunaan di component
const { data, isLoading, error } = useTransactions({
  month: "1",
  year: "2026",
});
const createMutation = useCreateTransaction();

const handleSubmit = (data: FormData) => {
  createMutation.mutate(data, {
    onSuccess: () => toast.success("Berhasil"),
    onError: (error) => toast.error(error.message),
  });
};
```

Setup QueryClientProvider di root layout:

```tsx
// components/providers.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

## Form dengan React Hook Form + Zod

Gunakan React Hook Form untuk semua form. Gunakan Zod untuk validasi schema.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  amount: z.number().min(1, "Minimal 1"),
  category: z.string().min(1, "Wajib diisi"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function TransactionForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // handle submit
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("amount", { valueAsNumber: true })} />
      {errors.amount && <span>{errors.amount.message}</span>}
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

## Client State dengan Zustand

Gunakan Zustand untuk UI state yang perlu di-share antar components. Jangan simpan server data di Zustand, gunakan React Query.

```tsx
// stores/ui-store.ts
import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
```

```tsx
// stores/auth-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "auth-storage" },
  ),
);
```

Penggunaan dengan selector untuk optimasi:

```tsx
// Ambil hanya yang dibutuhkan
const sidebarOpen = useUIStore((state) => state.sidebarOpen);
const toggleSidebar = useUIStore((state) => state.toggleSidebar);
```

## Service Layer

Service layer untuk komunikasi dengan backend. Fleksibel untuk Supabase, REST API, atau backend apapun.

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
    throw new Error(error.message || "Request failed");
  }

  return res.json();
}
```

```tsx
// services/transaction.ts
import { fetcher } from "./base";
import type { Transaction, CreateTransactionInput } from "@/types";

export const transactionService = {
  getAll: (options?: { month?: string; year?: string }) => {
    const params = new URLSearchParams();
    if (options?.month) params.set("month", options.month);
    if (options?.year) params.set("year", options.year);
    const query = params.toString();
    return fetcher<Transaction[]>(
      `/api/transactions${query ? `?${query}` : ""}`,
    );
  },

  getById: (id: string) => fetcher<Transaction>(`/api/transactions/${id}`),

  create: (data: CreateTransactionInput) =>
    fetcher<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateTransactionInput>) =>
    fetcher<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetcher<void>(`/api/transactions/${id}`, { method: "DELETE" }),
};
```

## Custom Hooks

Simpan di src/hooks untuk hooks reusable. Prefix dengan use.

```tsx
// hooks/use-debounce.ts
import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

```tsx
// hooks/use-media-query.ts
import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
```

## Styling dengan Tailwind CSS v4

Gunakan CSS variables untuk design tokens. Definisikan di globals.css dengan @theme inline.

```css
@import "tailwindcss";

:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --primary: #0ea5e9;
  --primary-foreground: #ffffff;
  --muted: #f1f5f9;
  --muted-foreground: #64748b;
  --border: #e2e8f0;
  --radius: 0.75rem;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
}

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

Gunakan clsx untuk conditional classes:

```tsx
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
```

## API Routes

```tsx
// app/api/transactions/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // fetch from database
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // validate and save to database
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
```

## Types

Definisikan types di src/types dengan barrel exports.

```tsx
// types/transaction.ts
export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
}
```

```tsx
// types/index.ts
export * from "./transaction";
export * from "./user";
```

## Barrel Exports

Setiap folder dengan multiple files harus punya index.ts untuk barrel exports.

```tsx
// services/index.ts
export { transactionService } from "./transaction";
export { userService } from "./user";
```

## Loading dan Error States

```tsx
// Loading
if (isLoading) {
  return <div className="animate-pulse bg-muted h-10 rounded-lg" />;
}

// Error
if (error) {
  return <div className="text-red-500">{error.message}</div>;
}
```

## Toast Notifications

```tsx
import { toast } from "sonner";

toast.success("Berhasil disimpan");
toast.error("Gagal menyimpan");
toast.loading("Menyimpan...");
```

## Dependencies Wajib

```json
{
  "dependencies": {
    "@hookform/resolvers": "latest",
    "@radix-ui/react-*": "latest",
    "@tanstack/react-query": "latest",
    "clsx": "latest",
    "lucide-react": "latest",
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "react-hook-form": "latest",
    "sonner": "latest",
    "zod": "latest",
    "zustand": "latest"
  }
}
```
