import type React from "react"
import type { Metadata, Viewport } from "next"
import { Archivo } from "next/font/google"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import { LenisProvider } from "@/components/scroll"
import "@/app/globals.css"


// Archivo untuk seluruh teks dan UI. Variable font, jadi tidak perlu
// mendaftar weight satu per satu.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "SIKAS - Sistem Informasi Keuangan Sahabat",
  description:
    "Sistem manajemen keuangan pribadi untuk Andino dan Sayu. Track expenses, manage categories, dan kelola keuangan bersama dengan mudah.",
  keywords: ["expense tracking", "finance management", "budget", "money management"],
  authors: [{ name: "SIKAS" }],
  creator: "SIKAS Team",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://sikas.app",
    title: "SIKAS - Sistem Informasi Keuangan Sahabat",
    description: "Sistem manajemen keuangan pribadi untuk mengelola keuangan bersama.",
    siteName: "SIKAS",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#0369a1",
  colorScheme: "light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${archivo.variable} font-sans antialiased`}>
        <Providers>
          <LenisProvider>{children}</LenisProvider>
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
