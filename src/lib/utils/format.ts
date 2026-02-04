export const JAKARTA_TIMEZONE = "Asia/Jakarta"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getJakartaDateString(): string {
  const now = new Date()
  const jakartaDate = new Intl.DateTimeFormat("sv-SE", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
  return jakartaDate
}

export function getJakartaDateTime(): {
  year: number
  month: number
  day: number
  hours: number
  minutes: number
} {
  const now = new Date()
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(now)

  const getPart = (type: string) => {
    const part = parts.find((p) => p.type === type)
    return part ? parseInt(part.value, 10) : 0
  }

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hours: getPart("hour"),
    minutes: getPart("minute"),
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIMEZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIMEZONE,
    day: "numeric",
    month: "short",
  }).format(date)
}

export function getMonthName(month: number): string {
  const date = new Date(2024, month - 1, 1)
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIMEZONE,
    month: "long"
  }).format(date)
}

export function getCurrentMonth(): number {
  const { month } = getJakartaDateTime()
  return month
}

export function getCurrentYear(): number {
  const { year } = getJakartaDateTime()
  return year
}

export function getLastDayOfMonth(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate()
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
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
