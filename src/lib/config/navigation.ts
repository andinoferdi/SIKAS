import { LucideIcon, Home, Receipt, PlusCircle, Plus } from "lucide-react"

export interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
  isMain?: boolean
}

export interface LandingMenuItem {
  href: string
  label: string
}

export interface FooterSection {
  title: string
  items: LandingMenuItem[]
}

export const dashboardNavItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: Home,
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: Receipt,
  },
  {
    href: "/dashboard/transactions/add",
    label: "Tambah Transaksi",
    icon: PlusCircle,
  },
]

export const bottomNavItems: MenuItem[] = [
  {
    href: "/dashboard",
    label: "Beranda",
    icon: Home,
  },
  {
    href: "/dashboard/transactions/add",
    label: "Tambah",
    icon: Plus,
    isMain: true,
  },
  {
    href: "/dashboard/transactions",
    label: "Transaksi",
    icon: Receipt,
  },
]

export const landingNavItems: LandingMenuItem[] = [
  {
    href: "#fitur",
    label: "Fitur",
  },
  {
    href: "#tentang",
    label: "Tentang",
  },
  {
    href: "/faq",
    label: "FAQ",
  },
]

export const footerSections: FooterSection[] = [
  {
    title: "Navigasi",
    items: [
      { href: "/", label: "Beranda" },
      { href: "/faq", label: "Pusat Bantuan" },
      { href: "/guide", label: "Panduan" },
    ],
  },
  {
    title: "Akun",
    items: [
      { href: "/login", label: "Masuk" },
      { href: "/register", label: "Daftar" },
    ],
  },
]
