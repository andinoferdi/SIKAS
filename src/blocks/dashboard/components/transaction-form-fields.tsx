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
import type { LucideIcon } from "lucide-react"
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

interface PaymentMethodOptionProps {
  icon: LucideIcon
  label: string
  fundTone: string
  selected: boolean
  compact: boolean
  onSelect: () => void
}

function PaymentMethodOption({
  icon: Icon,
  label,
  fundTone,
  selected,
  compact,
  onSelect,
}: PaymentMethodOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-xl border-2 p-3 transition-colors sm:gap-3 sm:p-4",
        compact && "justify-center gap-2",
        selected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-muted-foreground/30",
      )}
    >
      {compact ? (
        <Icon className={cn("h-5 w-5 shrink-0", selected ? fundTone : "text-muted-foreground")} />
      ) : (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10",
            selected ? "bg-primary/10" : "bg-muted",
          )}
        >
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", selected ? fundTone : "text-muted-foreground")} />
        </div>
      )}
      <span
        className={cn(
          "truncate text-sm",
          selected ? "font-semibold text-foreground" : "font-medium text-muted-foreground",
        )}
      >
        {label}
      </span>
    </button>
  )
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
          <p className="text-sm text-muted-foreground mt-2">
            Saldo {paymentMethod === "mbanking" ? "M-Banking" : "Cash"}: {formatCurrency(currentBalance)}
          </p>
        )}
        {errors?.amount && (
          <p className="text-sm text-danger-text mt-1">{errors.amount.message}</p>
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
          <p className="text-sm text-danger-text mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-card-foreground mb-2">Metode Pembayaran</label>
        <div className="grid grid-cols-2 gap-3">
          <PaymentMethodOption
            icon={Banknote}
            label="Cash"
            fundTone="text-fund-cash"
            selected={paymentMethod === "cash"}
            compact={compact}
            onSelect={() => onPaymentMethodChange("cash")}
          />
          <PaymentMethodOption
            icon={Smartphone}
            label="M-Banking"
            fundTone="text-fund-mbanking"
            selected={paymentMethod === "mbanking"}
            compact={compact}
            onSelect={() => onPaymentMethodChange("mbanking")}
          />
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
