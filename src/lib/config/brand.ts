export interface BrandConfig {
  name: string
  tagline: string
  version: string
  logo: {
    src: string
    alt: string
    width: number
    height: number
  }
}

export const brandConfig: BrandConfig = {
  name: "SIKAS",
  tagline: "Keuangan Bersama",
  version: "1.0",
  logo: {
    src: "/images/logo.png",
    alt: "SIKAS",
    width: 28,
    height: 28,
  },
}
