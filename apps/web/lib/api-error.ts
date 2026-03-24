/**
 * Parser de erros da API para mensagens amigáveis ao usuário.
 */

const ERROR_MESSAGES: Record<string, string> = {
    "Plano não encontrado.": "Seu plano não foi encontrado. Entre em contato com o suporte.",
    "Limite de 20 corridas do plano gratuito atingido. Faça o upgrade para continuar.":
        "Você atingiu o limite de corridas do plano gratuito. Faça o upgrade para continuar registrando.",
    "Unauthorized": "Sessão expirada. Faça login novamente.",
    "Forbidden": "Você não tem permissão para realizar esta ação.",
};

interface ApiErrorResponse {
    message?: string | string[];
    error?: string;
    statusCode?: number;
}

/**
 * Extrai uma mensagem amigável de um erro da API.
 * Tenta mapear a mensagem para uma versão em PT-BR.
 * Se não encontrar, retorna a mensagem original ou um fallback.
 */
export function parseApiError(error: unknown, fallback = "Ocorreu um erro inesperado. Tente novamente."): string {
    if (!error) return fallback;

    // Axios-style error
    const response = (error as any)?.response?.data as ApiErrorResponse | undefined;
    if (response) {
        if (Array.isArray(response.message)) {
            return response.message.join(", ");
        }
        
        const rawMessage = response.message || response.error;

        if (rawMessage) {
            return ERROR_MESSAGES[rawMessage] || rawMessage;
        }
    }

    // Standard Error
    if (error instanceof Error) {
        return ERROR_MESSAGES[error.message] || error.message;
    }

    // String error
    if (typeof error === "string") {
        return ERROR_MESSAGES[error] || error;
    }

    return fallback;
}
