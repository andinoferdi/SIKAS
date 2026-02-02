import { createClient } from "@/lib/supabase/server"
import type {
  UserChatContext,
  CategorySummary,
  AllTimeSummary,
  SearchTransactionsPayload,
} from "@/types/rag"
import type { Transaction, MonthlySummary } from "@/types/transaction"
import { getJakartaDateTime, JAKARTA_TIMEZONE } from "@/lib/utils/format"


export async function getUserContext(userId: string): Promise<UserChatContext> {
  const supabase = await createClient()

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("name, mbanking_balance, cash_balance")
    .eq("id", userId)
    .single()

  if (userError || !user) {
    throw new Error("User tidak ditemukan")
  }

  const { data: allTransactions, error: txError } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })

  if (txError) {
    throw new Error("Gagal mengambil data transaksi")
  }

  const transactions = allTransactions || []

  const allTimeSummary = calculateAllTimeSummary(transactions)

  const jakartaTime = getJakartaDateTime()
  const currentMonth = jakartaTime.month
  const currentYear = jakartaTime.year
  const monthlySummary = calculateMonthlySummary(transactions, currentMonth, currentYear)

  const recentTransactions = transactions.slice(0, 10)

  return {
    userId,
    userName: user.name,
    balances: {
      mbanking: Number(user.mbanking_balance),
      cash: Number(user.cash_balance),
    },
    allTimeSummary,
    monthlySummary: {
      ...monthlySummary,
      month: currentMonth,
      year: currentYear,
    },
    recentTransactions,
  }
}

function calculateAllTimeSummary(transactions: Transaction[]): AllTimeSummary {
  let totalIncome = 0
  let totalExpense = 0
  const categoryMap = new Map<string, { total: number; count: number }>()

  for (const tx of transactions) {
    if (tx.type === "income") {
      totalIncome += Number(tx.amount)
    } else {
      totalExpense += Number(tx.amount)
    }

    const key = `${tx.type}:${tx.category}`
    const existing = categoryMap.get(key) || { total: 0, count: 0 }
    categoryMap.set(key, {
      total: existing.total + Number(tx.amount),
      count: existing.count + 1,
    })
  }

  const byCategory: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([key, value]) => ({
      category: key,
      total: value.total,
      count: value.count,
    }))
    .sort((a, b) => b.total - a.total)

  return {
    totalIncome,
    totalExpense,
    byCategory,
  }
}

function calculateMonthlySummary(
  transactions: Transaction[],
  month: number,
  year: number
): MonthlySummary {
  let total_income = 0
  let total_expense = 0

  for (const tx of transactions) {
    const txDate = new Date(tx.transaction_date)
    if (txDate.getMonth() + 1 === month && txDate.getFullYear() === year) {
      if (tx.type === "income") {
        total_income += Number(tx.amount)
      } else {
        total_expense += Number(tx.amount)
      }
    }
  }

  return {
    total_income,
    total_expense,
    net: total_income - total_expense,
  }
}


export async function searchUserTransactions(
  userId: string,
  filters: SearchTransactionsPayload
): Promise<Transaction[]> {
  const supabase = await createClient()

  let query = supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("transaction_date", { ascending: false })

  if (filters.type) {
    query = query.eq("type", filters.type)
  }

  if (filters.category) {
    query = query.ilike("category", `%${filters.category}%`)
  }

  if (filters.description) {
    query = query.ilike("description", `%${filters.description}%`)
  }

  if (filters.startDate) {
    query = query.gte("transaction_date", filters.startDate)
  }

  if (filters.endDate) {
    query = query.lte("transaction_date", filters.endDate)
  }

  const { data, error } = await query.limit(20)

  if (error) {
    throw new Error("Gagal mencari transaksi")
  }

  return data || []
}


export function formatUserContextForPrompt(context: UserChatContext): string {
  const { userName, balances, monthlySummary, recentTransactions, allTimeSummary } = context

  const formatRp = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  let prompt = `## ${userName}\n`
  prompt += `Saldo: M-Banking ${formatRp(balances.mbanking)} | Cash ${formatRp(balances.cash)}\n`

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  prompt += `${monthNames[monthlySummary.month - 1]} ${monthlySummary.year}: +${formatRp(monthlySummary.total_income)} -${formatRp(monthlySummary.total_expense)} = ${formatRp(monthlySummary.net)}\n`

  if (monthlySummary.total_income > 0) {
    const expenseRatio = (monthlySummary.total_expense / monthlySummary.total_income * 100).toFixed(1)
    prompt += `\n### Rasio Pengeluaran Bulan Ini: ${expenseRatio}%\n`
    if (parseFloat(expenseRatio) < 50) {
      prompt += `Status: Sangat Hemat\n`
    } else if (parseFloat(expenseRatio) < 70) {
      prompt += `Status: Seimbang\n`
    } else if (parseFloat(expenseRatio) < 90) {
      prompt += `Status: Perlu Perhatian\n`
    } else {
      prompt += `Status: Boros\n`
    }
  } else if (monthlySummary.total_expense > 0) {
    prompt += `\n### Rasio Pengeluaran Bulan Ini: Tidak ada pemasukan tercatat\n`
    prompt += `Status: Perlu mencatat pemasukan untuk analisis\n`
  }

  if (allTimeSummary && allTimeSummary.byCategory.length > 0) {
    const expenseCategories = allTimeSummary.byCategory
      .filter(c => c.category.startsWith("expense:"))
      .slice(0, 5)

    if (expenseCategories.length > 0) {
      prompt += `\n### Top 5 Kategori Pengeluaran (Sepanjang Waktu)\n`
      for (const cat of expenseCategories) {
        const categoryName = cat.category.split(":")[1]
        prompt += `- ${categoryName}: ${formatRp(cat.total)} (${cat.count}x transaksi)\n`
      }
    }
  }

  if (recentTransactions.length > 0) {
    prompt += `\n### Transaksi Terakhir (ID untuk edit/hapus)\n`
    for (const tx of recentTransactions.slice(0, 8)) {
      const sign = tx.type === "income" ? "+" : "-"
      const date = new Date(tx.transaction_date).toLocaleDateString("id-ID", { timeZone: JAKARTA_TIMEZONE, day: "2-digit", month: "short" })
      prompt += `[${tx.id}] ${date}: ${sign}${formatRp(tx.amount)} ${tx.category}`
      if (tx.description) prompt += ` (${tx.description})`
      prompt += ` [${tx.payment_method}]\n`
    }
  }

  return prompt
}
