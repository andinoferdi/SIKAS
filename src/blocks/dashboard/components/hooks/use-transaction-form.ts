"use client";

import { useMemo, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCurrentUser, useCategories } from "@/hooks";
import {
  transactionFormSchema,
  type TransactionFormData,
} from "@/lib/validations";
import {
  formatInputCurrency,
  parseInputCurrency,
  formatCurrency,
  getJakartaDateString,
} from "@/lib/utils/format";
import type { TransactionType, Transaction } from "@/types";

const MIN_MBANKING_BALANCE = 50000;

interface UseTransactionFormOptions {
  initialTransaction?: Transaction;
}

export function useTransactionForm({
  initialTransaction,
}: UseTransactionFormOptions = {}) {
  const { data: user } = useCurrentUser();

  const defaultValues: TransactionFormData = initialTransaction
    ? {
        type: initialTransaction.type,
        amount: formatInputCurrency(String(initialTransaction.amount)),
        category: initialTransaction.category,
        description: initialTransaction.description || "",
        payment_method: initialTransaction.payment_method,
        transaction_date: initialTransaction.transaction_date,
      }
    : {
        type: "expense",
        amount: "",
        category: "",
        description: "",
        payment_method: "cash",
        transaction_date: getJakartaDateString(),
      };

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues,
  });

  const { control, setValue, setError: setFormError } = form;

  const type = useWatch({ control, name: "type" });
  const amount = useWatch({ control, name: "amount" });
  const paymentMethod = useWatch({ control, name: "payment_method" });
  const category = useWatch({ control, name: "category" });

  const { data: categories = [] } = useCategories(type);

  useEffect(() => {
    if (categories.length > 0 && !category) {
      setValue("category", categories[0].name);
    }
  }, [categories, category, setValue]);

  useEffect(() => {
    if (initialTransaction && categories.length > 0) {
      const validCategory = categories.find((c) => c.name === category);
      if (!validCategory) {
        setValue("category", categories[0].name);
      }
    }
  }, [categories, category, initialTransaction, setValue]);

  const balanceWarning = useMemo(() => {
    if (!user) return "";

    const numericAmount = parseInputCurrency(amount);
    if (!numericAmount) return "";

    if (initialTransaction) {
      const oldAmount = initialTransaction.amount;
      const oldType = initialTransaction.type;
      const oldPaymentMethod = initialTransaction.payment_method;

      let mbankingBalance = Number(user.mbanking_balance);
      let cashBalance = Number(user.cash_balance);

      if (oldType === "expense") {
        if (oldPaymentMethod === "mbanking") {
          mbankingBalance += oldAmount;
        } else {
          cashBalance += oldAmount;
        }
      } else {
        if (oldPaymentMethod === "mbanking") {
          mbankingBalance -= oldAmount;
        } else {
          cashBalance -= oldAmount;
        }
      }

      if (type === "expense") {
        if (paymentMethod === "mbanking") {
          mbankingBalance -= numericAmount;
        } else {
          cashBalance -= numericAmount;
        }
      } else {
        if (paymentMethod === "mbanking") {
          mbankingBalance += numericAmount;
        } else {
          cashBalance += numericAmount;
        }
      }

      if (cashBalance < 0) {
        return "Saldo Cash tidak cukup untuk perubahan ini";
      }

      if (mbankingBalance < MIN_MBANKING_BALANCE) {
        return `Saldo M-Banking minimal harus ${formatCurrency(MIN_MBANKING_BALANCE)}`;
      }

      return "";
    }

    if (type !== "expense") return "";

    const currentBalance =
      paymentMethod === "mbanking"
        ? Number(user.mbanking_balance)
        : Number(user.cash_balance);

    if (numericAmount > currentBalance) {
      return "Saldo tidak cukup";
    }

    if (paymentMethod === "mbanking") {
      const remainingBalance = currentBalance - numericAmount;
      if (remainingBalance < MIN_MBANKING_BALANCE) {
        return `Minimal saldo M-Banking harus ${formatCurrency(MIN_MBANKING_BALANCE)}`;
      }
    }

    return "";
  }, [amount, paymentMethod, type, user, initialTransaction]);

  const handleAmountChange = (value: string) => {
    const formatted = formatInputCurrency(value);
    setValue("amount", formatted);
  };

  const handleTypeChange = (newType: TransactionType) => {
    setValue("type", newType);
  };

  const handleCategoryChange = (value: string) => {
    setValue("category", value);
  };

  const handlePaymentMethodChange = (method: "cash" | "mbanking") => {
    setValue("payment_method", method);
  };

  const handleDateChange = (date: string) => {
    setValue("transaction_date", date);
  };

  const validateAndGetAmount = (): number | null => {
    const numericAmount = parseInputCurrency(amount);

    if (!numericAmount) {
      toast.error("Jumlah tidak valid");
      return null;
    }

    if (balanceWarning) {
      setFormError("root", { message: balanceWarning });
      toast.error(balanceWarning);
      return null;
    }

    return numericAmount;
  };

  const getCurrentBalance = () => {
    if (!user) return 0;
    return paymentMethod === "mbanking"
      ? Number(user.mbanking_balance)
      : Number(user.cash_balance);
  };

  return {
    form,
    type,
    amount,
    paymentMethod,
    category,
    categories,
    user,
    balanceWarning,
    handleAmountChange,
    handleTypeChange,
    handleCategoryChange,
    handlePaymentMethodChange,
    handleDateChange,
    validateAndGetAmount,
    getCurrentBalance,
    MIN_MBANKING_BALANCE,
  };
}
