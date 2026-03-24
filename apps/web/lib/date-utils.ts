/**
 * Utilitário centralizado de manipulação de datas.
 *
 * Regra de ouro:
 * - Backend SEMPRE trabalha em UTC (ISO 8601).
 * - Frontend converte para horário local APENAS na exibição.
 */

/**
 * Converte uma string ISO (UTC) para o formato aceito por
 * `<input type="datetime-local">` no fuso horário local do usuário.
 *
 * @example toLocalInputValue("2026-03-22T18:30:00.000Z") → "2026-03-22T15:30" (UTC-3)
 */
export function toLocalInputValue(isoString: string): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().substring(0, 16);
}

/**
 * Converte o valor de um `<input type="datetime-local">` (horário local)
 * para uma string ISO em UTC, pronta para enviar ao backend.
 *
 * @example toISOFromLocalInput("2026-03-22T15:30") → "2026-03-22T18:30:00.000Z" (UTC-3)
 */
export function toISOFromLocalInput(localValue: string): string {
    if (!localValue) return "";
    return new Date(localValue).toISOString();
}

/**
 * Formata uma data ISO para exibição no padrão PT-BR.
 *
 * @example formatDisplayDate("2026-03-22T18:30:00.000Z") → "22/03/2026 15:30"
 */
export function formatDisplayDate(isoString: string): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Formata uma data ISO para exibição relativa ("há 2 horas", "ontem", etc).
 */
export function formatRelativeDate(isoString: string): string {
    if (!isoString) return "";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";

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
