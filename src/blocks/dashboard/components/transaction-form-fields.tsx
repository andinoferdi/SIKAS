"use client"

import { memo } from "react"
import {
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  DatePicker,
} from "@/components/ui"
import type { TransactionType, Category } from "@/types"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/format"
import { Banknote, Smartphone, AlertCircle } from "lucide-react"
import type { UseFormRegister, FieldErrors } from "react-hook-form"
import type { TransactionFormData } from "@/lib/validations"

interface TransactionFormFieldsProps {
  type: TransactionType
  paymentMethod: "cash" | "mbanking"
  category: string
  categories: Category[]
  transactionDate: string
  description: string
  showBalanceInfo?: boolean
  currentBalance?: number
  balanceWarning?: string
  errors?: FieldErrors<TransactionFormData>
  register: UseFormRegister<TransactionFormData>
  onTypeChange: (type: TransactionType) => void
  onAmountChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onPaymentMethodChange: (method: "cash" | "mbanking") => void
  onDateChange: (date: string) => void
  compact?: boolean
}

export const TransactionFormFields = memo(function TransactionFormFields({
  type,
  paymentMethod,
  category,
  categories,
  transactionDate,
  showBalanceInfo = false,
  currentBalance = 0,
  balanceWarning,
  errors,
  register,
  onTypeChange,
  onAmountChange,
  onCategoryChange,
  onPaymentMethodChange,
  onDateChange,
  compact = false,
}: TransactionFormFieldsProps) {
  const defaultCategory = categories.length > 0 ? categories[0].name : ""

  return (
    <div className={cn("space-y-5", compact && "space-y-6")}>
      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Tipe</label>
        <Tabs value={type} onValueChange={(val) => onTypeChange(val as TransactionType)}>
          <TabsList className={cn("w-full", !compact && "bg-muted p-1 rounded-xl")}>
            <TabsTrigger
              value="expense"
              className={cn("flex-1", !compact && "rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm")}
            >
              <span className={type === "expense" ? "text-destructive font-medium" : "text-muted-foreground"}>
                Pengeluaran
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={cn("flex-1", !compact && "rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm")}
            >
              <span className={type === "income" ? "text-success font-medium" : "text-muted-foreground"}>
                Pemasukan
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Jumlah</label>
        <div className="relative">
          <span className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground",
            compact ? "text-sm" : "text-lg"
          )}>
            Rp
          </span>
          <Input
            type="text"
            inputMode="numeric"
            placeholder="0"
            {...register("amount")}
            onChange={(e) => onAmountChange(e.target.value)}
            className={cn(compact ? "pl-10" : "text-2xl font-bold pl-12 h-14")}
          />
        </div>
        {showBalanceInfo && type === "expense" && (
          <p className="text-xs text-muted-foreground mt-2">
            Saldo {paymentMethod === "mbanking" ? "M-Banking" : "Cash"}: {formatCurrency(currentBalance)}
          </p>
        )}
        {errors?.amount && (
          <p className="text-xs text-danger-text mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Kategori</label>
        <Select value={category || defaultCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className={compact ? undefined : "h-12"}>
            <SelectValue placeholder="Pilih kategori" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.category && (
          <p className="text-xs text-danger-text mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Metode Pembayaran</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onPaymentMethodChange("cash")}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
              compact && "justify-center gap-2",
              paymentMethod === "cash"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            {!compact && (
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                paymentMethod === "cash" ? "bg-primary/20" : "bg-muted"
              )}>
                <Banknote className={cn(
                  "h-5 w-5",
                  paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            )}
            {compact && (
              <Banknote className={cn(
                "h-5 w-5",
                paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            <span className={cn(
              "font-medium text-sm",
              paymentMethod === "cash" ? "text-primary" : "text-muted-foreground"
            )}>
              Cash
            </span>
          </button>
          <button
            type="button"
            onClick={() => onPaymentMethodChange("mbanking")}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
              compact && "justify-center gap-2",
              paymentMethod === "mbanking"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/30"
            )}
          >
            {!compact && (
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                paymentMethod === "mbanking" ? "bg-primary/20" : "bg-muted"
              )}>
                <Smartphone className={cn(
                  "h-5 w-5",
                  paymentMethod === "mbanking" ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
            )}
            {compact && (
              <Smartphone className={cn(
                "h-5 w-5",
                paymentMethod === "mbanking" ? "text-primary" : "text-muted-foreground"
              )} />
            )}
            <span className={cn(
              "font-medium text-sm",
              paymentMethod === "mbanking" ? "text-primary" : "text-muted-foreground"
            )}>
              M-Banking
            </span>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Tanggal</label>
        <DatePicker value={transactionDate} onChange={onDateChange} placeholder="Pilih tanggal" />
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">
          {compact ? "Deskripsi (opsional)" : (
            <>Keterangan <span className="text-muted-foreground font-normal">(opsional)</span></>
          )}
        </label>
        <Input
          type="text"
          placeholder={compact ? "Tambahkan catatan" : "Contoh: Makan siang"}
          {...register("description")}
          className={compact ? undefined : "h-12"}
        />
      </div>

      {balanceWarning && (
        <div className={cn(
          "flex items-center gap-2 p-3 border rounded-xl",
          compact ? "bg-danger-bg border-danger-border items-start gap-3 p-4" : "bg-warning-bg border-warning-border"
        )}>
          <AlertCircle className={cn(
            "h-4 w-4 shrink-0",
            compact ? "h-5 w-5 text-danger mt-0.5" : "text-warning"
          )} />
          <p className={cn("text-sm", compact ? "text-danger-text" : "text-warning-text")}>
            {balanceWarning}
          </p>
        </div>
      )}

      {errors?.root && !balanceWarning && (
        <div className="flex items-center gap-2 p-3 bg-danger-bg border border-danger-border rounded-xl">
          <AlertCircle className="h-4 w-4 text-danger shrink-0" />
          <p className="text-sm text-danger-text">{errors.root.message}</p>
        </div>
      )}
    </div>
  )
})
