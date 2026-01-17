import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import { Providers } from "@/components/providers"
import "@/app/globals.css"


const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  themeColor: "#c9b896",
  colorScheme: "light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${plusJakarta.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
