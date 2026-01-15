import type React from "react"
import type { Metadata, Viewport } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Toaster } from "sonner"
import "@/app/globals.css"

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Keuangan Kita - Smart Expense Management",
  description:
    "Kelola keuangan bersama dengan mudah. Track expenses, manage categories, dan pahami spending patterns Anda dengan interface yang indah dan intuitif.",
  keywords: ["expense tracking", "finance management", "budget", "money management"],
  authors: [{ name: "Keuangan Kita" }],
  creator: "Keuangan Kita Team",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://keuangankita.app",
    title: "Keuangan Kita - Smart Expense Management",
    description: "Kelola keuangan bersama dengan mudah dan efisien.",
    siteName: "Keuangan Kita",
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
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
