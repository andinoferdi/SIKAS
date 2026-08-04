import type React from "react"
import type { Metadata, Viewport } from "next"
import { Archivo, Instrument_Serif } from "next/font/google"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import "@/app/globals.css"


// Archivo untuk seluruh teks dan UI. Variable font, jadi tidak perlu
// mendaftar weight satu per satu.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
})

// Instrument Serif hanya punya satu weight dan dipakai khusus untuk
// display dan heading.
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
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
      <body className={`${archivo.variable} ${instrumentSerif.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
