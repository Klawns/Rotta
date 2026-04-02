type QueryFilters = object;

export const rideKeys = {
  all: ['rides'] as const,
  lists: () => [...rideKeys.all, 'list'] as const,
  list: (filters: QueryFilters = {}) =>
    [...rideKeys.lists(), { filters }] as const,
  infinite: (filters: QueryFilters = {}) =>
    [...rideKeys.lists(), { filters }, 'infinite'] as const,
  details: () => [...rideKeys.all, 'detail'] as const,
  detail: (id: string) => [...rideKeys.details(), id] as const,
  stats: (filters: QueryFilters) =>
    [...rideKeys.all, 'stats', { filters }] as const,
  count: () => [...rideKeys.all, 'count'] as const,
  byClient: (clientId: string, filters: QueryFilters = {}) =>
    [...rideKeys.all, 'byClient', clientId, 'infinite', { filters }] as const,
  frequentClients: () => [...rideKeys.all, 'frequent-clients'] as const,
};

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  infinite: (filters: QueryFilters = {}) =>
    [...clientKeys.all, { filters }, 'infinite'] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
  balance: (id: string) => [...clientKeys.detail(id), 'balance'] as const,
  payments: (id: string, filters: QueryFilters = {}) =>
    [...clientKeys.detail(id), 'payments', { filters }] as const,
};

export const settingsKeys = {
  all: ['settings'] as const,
  presets: () => [...settingsKeys.all, 'presets'] as const,
  backups: () => [...settingsKeys.all, 'backups'] as const,
  backupsStatus: () => [...settingsKeys.all, 'backups-status'] as const,
  backupImport: (id: string) => [...settingsKeys.all, 'backup-import', id] as const,
};

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'me'] as const,
};

export const paymentKeys = {
  all: ['payments'] as const,
  plans: () => [...paymentKeys.all, 'plans'] as const,
};

export const financeKeys = {
  all: ['finance'] as const,
  dashboard: (filters: QueryFilters) =>
    [...financeKeys.all, 'dashboard', { filters }] as const,
};

export const adminKeys = {
  all: ['admin'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
  usersAll: () => [...adminKeys.all, 'users'] as const,
  users: (filters: { page?: number; limit?: number; search?: string }) =>
    [...adminKeys.usersAll(), filters] as const,
  settings: () => [...adminKeys.all, 'settings'] as const,
  configs: () => [...adminKeys.settings(), 'configs'] as const,
  plans: () => [...adminKeys.settings(), 'plans'] as const,
  promoCodes: () => [...adminKeys.settings(), 'promo-codes'] as const,
  technicalBackups: () => [...adminKeys.settings(), 'technical-backups'] as const,
};
