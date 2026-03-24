// Chaves padronizadas para uso no React Query.
// Mantém hierarquia consistente para facilitar Invalidação de Cache.

export const rideKeys = {
  all: ['rides'] as const,
  lists: () => [...rideKeys.all, 'list'] as const,
  list: (filters: string | object) => [...rideKeys.lists(), { filters }] as const,
  infinite: (filters: string | object) => [...rideKeys.lists(), { filters }, 'infinite'] as const,
  details: () => [...rideKeys.all, 'detail'] as const,
  detail: (id: string) => [...rideKeys.details(), id] as const,
  stats: (period: string) => [...rideKeys.all, 'stats', period] as const,
  byClient: (clientId: string) => [...rideKeys.all, 'byClient', clientId, 'infinite'] as const,
};

export const clientKeys = {
  all: ['clients', 'v2'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  infinite: (filters: string | object) => [...clientKeys.all, { filters }, 'infinite'] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
};

export const settingsKeys = {
  all: ['settings'] as const,
  presets: () => [...settingsKeys.all, 'presets'] as const,
};
