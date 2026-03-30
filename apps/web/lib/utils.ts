import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDisplayDateValue } from "./date-utils";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date) {
  return formatDisplayDateValue(date, "---");
}
