export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
  }).format(date)
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1)
  return new Intl.DateTimeFormat("id-ID", { month: "long" }).format(date)
}

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function formatInputCurrency(value: string): string {
  const numericValue = value.replace(/\D/g, "")
  if (!numericValue) return ""
  return new Intl.NumberFormat("id-ID").format(Number(numericValue))
}

export function parseInputCurrency(value: string): number {
  const numericValue = value.replace(/\D/g, "")
  return Number(numericValue) || 0
}
