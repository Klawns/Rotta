/**
 * Utilitários de formatação para a aplicação.
 */
export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(value);
};
