import { format } from "date-fns";

/**
 * Utilitário centralizado de manipulação de datas.
 *
 * Regra de ouro:
 * - Backend SEMPRE trabalha em UTC (ISO 8601).
 * - Frontend converte para horário local APENAS na exibição.
 */

function isValidDateInstance(value: Date) {
  return !Number.isNaN(value.getTime());
}

export function normalizeDateValue(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isValidDateInstance(value) ? value : null;
  }

  if (typeof value === "number") {
    const date = new Date(value);
    return isValidDateInstance(date) ? date : null;
  }

  if (typeof value === "string") {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return null;
    }

    const date = new Date(normalizedValue);
    return isValidDateInstance(date) ? date : null;
  }

  return null;
}

export function resolveRideDateValue(rideDate: unknown, createdAt?: unknown) {
  return normalizeDateValue(rideDate) ?? normalizeDateValue(createdAt);
}

export function formatDateValue(
  value: unknown,
  pattern: string,
  fallback = "---",
) {
  const date = normalizeDateValue(value);
  return date ? format(date, pattern) : fallback;
}

export function formatResolvedDateValue(
  primaryValue: unknown,
  secondaryValue: unknown,
  pattern: string,
  fallback = "---",
) {
  const date =
    normalizeDateValue(primaryValue) ?? normalizeDateValue(secondaryValue);

  return date ? format(date, pattern) : fallback;
}

export function formatDisplayDateValue(
  value: unknown,
  fallback = "Data indisponível",
) {
  const date = normalizeDateValue(value);
  if (!date) return fallback;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toLocalInputValue(isoString: string): string {
  const date = normalizeDateValue(isoString);
  if (!date) return "";

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().substring(0, 16);
}

export function toISOFromLocalInput(localValue: string): string {
  if (!localValue) return "";
  return new Date(localValue).toISOString();
}

export function formatDisplayDate(isoString: string): string {
  const date = normalizeDateValue(isoString);
  if (!date) return "";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(isoString: string): string {
  const date = normalizeDateValue(isoString);
  if (!date) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "agora mesmo";
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7) return `há ${diffDays} dias`;

  return formatDisplayDate(isoString);
}
