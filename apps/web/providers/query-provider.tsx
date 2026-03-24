'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Configurações padrão para um SaaS robusto
            staleTime: 60 * 1000, // 1 minuto até os dados serem considerados "velhos"
            gcTime: 5 * 60 * 1000, // 5 minutos de cache em memória
            retry: 1, // Tentar apenas uma vez em caso de falha de rede
            refetchOnWindowFocus: true, // Revalidar ao voltar para a aba
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
