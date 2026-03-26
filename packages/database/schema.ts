import { pgTable, text as pgText, real as pgReal, integer as pgInteger, timestamp as pgTimestamp, boolean as pgBoolean, index as pgIndex } from 'drizzle-orm/pg-core';
import { sqliteTable, text as sqText, real as sqReal, integer as sqInteger, index as sqIndex } from 'drizzle-orm/sqlite-core';

const isPostgres = process.env.DB_PROVIDER === 'postgres';

// --- Users ---
export const users = isPostgres
  ? pgTable('users', {
      id: pgText('id').primaryKey(),
      name: pgText('name').notNull(),
      email: pgText('email').notNull().unique(),
      password: pgText('password').notNull(),
      taxId: pgText('tax_id'),
      cellphone: pgText('cellphone'),
      role: pgText('role').notNull().default('user'), // PG enums are handled via text or pgEnum, using text for compatibility
      hasSeenTutorial: pgBoolean('has_seen_tutorial').default(false),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    })
  : sqliteTable('users', {
      id: sqText('id').primaryKey(),
      name: sqText('name').notNull(),
      email: sqText('email').notNull().unique(),
      password: sqText('password').notNull(),
      taxId: sqText('tax_id'),
      cellphone: sqText('cellphone'),
      role: sqText('role', { enum: ['admin', 'user'] }).notNull().default('user'),
      hasSeenTutorial: sqInteger('has_seen_tutorial', { mode: 'boolean' }).default(false),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    });

// --- Refresh Tokens ---
export const refreshTokens = isPostgres
  ? pgTable('refresh_tokens', {
      id: pgText('id').primaryKey(),
      token: pgText('token').notNull().unique(),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      expiresAt: pgTimestamp('expires_at').notNull(),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userIdIdx: pgIndex('refresh_tokens_user_id_idx').on(table.userId),
    }))
  : sqliteTable('refresh_tokens', {
      id: sqText('id').primaryKey(),
      token: sqText('token').notNull().unique(),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      expiresAt: sqInteger('expires_at', { mode: 'timestamp' }).notNull(),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userIdIdx: sqIndex('refresh_tokens_user_id_idx').on(table.userId),
    }));

// --- Clients ---
export const clients = isPostgres
  ? pgTable('clients', {
      id: pgText('id').primaryKey(),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      name: pgText('name').notNull(),
      phone: pgText('phone'),
      address: pgText('address'),
      balance: pgReal('balance').notNull().default(0),
      isPinned: pgBoolean('is_pinned').notNull().default(false),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userIdIdx: pgIndex('clients_user_id_idx').on(table.userId),
    }))
  : sqliteTable('clients', {
      id: sqText('id').primaryKey(),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      name: sqText('name').notNull(),
      phone: sqText('phone'),
      address: sqText('address'),
      balance: sqReal('balance').notNull().default(0),
      isPinned: sqInteger('is_pinned', { mode: 'boolean' }).notNull().default(false),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userIdIdx: sqIndex('clients_user_id_idx').on(table.userId),
    }));

// --- Balance Transactions ---
export const balanceTransactions = isPostgres
  ? pgTable('balance_transactions', {
      id: pgText('id').primaryKey(),
      clientId: pgText('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      amount: pgReal('amount').notNull(),
      type: pgText('type').notNull(), // 'CREDIT' | 'DEBIT'
      origin: pgText('origin').notNull(), // 'PAYMENT_OVERFLOW' | 'RIDE_USAGE' | 'MANUAL_ADJUSTMENT'
      description: pgText('description'),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userIdIdx: pgIndex('balance_transactions_user_id_idx').on(table.userId),
      clientIdIdx: pgIndex('balance_transactions_client_id_idx').on(table.clientId),
    }))
  : sqliteTable('balance_transactions', {
      id: sqText('id').primaryKey(),
      clientId: sqText('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      amount: sqReal('amount').notNull(),
      type: sqText('type', { enum: ['CREDIT', 'DEBIT'] }).notNull(),
      origin: sqText('origin', { enum: ['PAYMENT_OVERFLOW', 'RIDE_USAGE', 'MANUAL_ADJUSTMENT'] }).notNull(),
      description: sqText('description'),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userIdIdx: sqIndex('balance_transactions_user_id_idx').on(table.userId),
      clientIdIdx: sqIndex('balance_transactions_client_id_idx').on(table.clientId),
    }));

// --- Rides ---
export const rides = isPostgres
  ? pgTable('rides', {
      id: pgText('id').primaryKey(),
      clientId: pgText('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      value: pgReal('value').notNull(),
      location: pgText('location'),
      notes: pgText('notes'),
      status: pgText('status').notNull().default('COMPLETED'),
      paymentStatus: pgText('payment_status').notNull().default('PAID'),
      paidWithBalance: pgReal('paid_with_balance').notNull().default(0),
      debtValue: pgReal('debt_value').notNull().default(0),
      rideDate: pgTimestamp('ride_date'),
      photo: pgText('photo'),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userListIdx: pgIndex('rides_user_list_idx').on(table.userId, table.rideDate, table.createdAt, table.id),
      clientListIdx: pgIndex('rides_client_list_idx').on(table.userId, table.clientId, table.rideDate, table.createdAt, table.id),
      userDateStatusIdx: pgIndex('rides_user_date_status_idx').on(table.userId, table.rideDate, table.status),
    }))
  : sqliteTable('rides', {
      id: sqText('id').primaryKey(),
      clientId: sqText('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      value: sqReal('value').notNull(),
      location: sqText('location'),
      notes: sqText('notes'),
      status: sqText('status', { enum: ['PENDING', 'COMPLETED', 'CANCELLED'] }).notNull().default('COMPLETED'),
      paymentStatus: sqText('payment_status', { enum: ['PENDING', 'PAID'] }).notNull().default('PAID'),
      paidWithBalance: sqReal('paid_with_balance').notNull().default(0),
      debtValue: sqReal('debt_value').notNull().default(0),
      rideDate: sqInteger('ride_date', { mode: 'timestamp' }),
      photo: sqText('photo'),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userListIdx: sqIndex('rides_user_list_idx').on(table.userId, table.rideDate, table.createdAt, table.id),
      clientListIdx: sqIndex('rides_client_list_idx').on(table.userId, table.clientId, table.rideDate, table.createdAt, table.id),
      userDateStatusIdx: sqIndex('rides_user_date_status_idx').on(table.userId, table.rideDate, table.status),
    }));

// --- Ride Presets ---
export const ridePresets = isPostgres
  ? pgTable('ride_presets', {
      id: pgText('id').primaryKey(),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      label: pgText('label').notNull(),
      value: pgReal('value').notNull(),
      location: pgText('location').notNull(),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userIdIdx: pgIndex('ride_presets_user_id_idx').on(table.userId),
    }))
  : sqliteTable('ride_presets', {
      id: sqText('id').primaryKey(),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      label: sqText('label').notNull(),
      value: sqReal('value').notNull(),
      location: sqText('location').notNull(),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userIdIdx: sqIndex('ride_presets_user_id_idx').on(table.userId),
    }));

// --- Subscriptions ---
export const subscriptions = isPostgres
  ? pgTable('subscriptions', {
      id: pgText('id').primaryKey(),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      plan: pgText('plan').notNull(), // 'starter' | 'premium' | 'lifetime'
      status: pgText('status').notNull(), // 'active' | 'inactive' | 'canceled' | 'trial'
      rideCount: pgInteger('ride_count').notNull().default(0),
      validUntil: pgTimestamp('valid_until'),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userIdIdx: pgIndex('subscriptions_user_id_idx').on(table.userId),
    }))
  : sqliteTable('subscriptions', {
      id: sqText('id').primaryKey(),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      plan: sqText('plan', { enum: ['starter', 'premium', 'lifetime'] }).notNull(),
      status: sqText('status', { enum: ['active', 'inactive', 'canceled', 'trial'] }).notNull(),
      rideCount: sqInteger('ride_count').notNull().default(0),
      validUntil: sqInteger('valid_until', { mode: 'timestamp' }),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userIdIdx: sqIndex('subscriptions_user_id_idx').on(table.userId),
    }));

// --- Pricing Plans ---
export const pricingPlans = isPostgres
  ? pgTable('pricing_plans', {
      id: pgText('id').primaryKey(),
      name: pgText('name').notNull(),
      price: pgInteger('price').notNull(),
      interval: pgText('interval'),
      description: pgText('description').notNull(),
      features: pgText('features').notNull(),
      cta: pgText('cta').notNull(),
      highlight: pgBoolean('highlight').notNull().default(false),
      updatedAt: pgTimestamp('updated_at').notNull().defaultNow(),
    })
  : sqliteTable('pricing_plans', {
      id: sqText('id').primaryKey(),
      name: sqText('name').notNull(),
      price: sqInteger('price').notNull(),
      interval: sqText('interval'),
      description: sqText('description').notNull(),
      features: sqText('features').notNull(),
      cta: sqText('cta').notNull(),
      highlight: sqInteger('highlight', { mode: 'boolean' }).notNull().default(false),
      updatedAt: sqInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    });

// --- System Configs ---
export const systemConfigs = isPostgres
  ? pgTable('system_configs', {
      key: pgText('key').primaryKey(),
      value: pgText('value').notNull(),
      description: pgText('description'),
      updatedAt: pgTimestamp('updated_at').notNull().defaultNow(),
    })
  : sqliteTable('system_configs', {
      key: sqText('key').primaryKey(),
      value: sqText('value').notNull(),
      description: sqText('description'),
      updatedAt: sqInteger('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    });

// --- Client Payments ---
export const clientPayments = isPostgres
  ? pgTable('client_payments', {
      id: pgText('id').primaryKey(),
      clientId: pgText('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
      userId: pgText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      amount: pgReal('amount').notNull(),
      paymentDate: pgTimestamp('payment_date').notNull().defaultNow(),
      status: pgText('status').notNull().default('UNUSED'), // 'UNUSED' | 'USED'
      notes: pgText('notes'),
      createdAt: pgTimestamp('created_at').notNull().defaultNow(),
    }, (table) => ({
      userIdIdx: pgIndex('client_payments_user_id_idx').on(table.userId),
      clientIdIdx: pgIndex('client_payments_client_id_idx').on(table.clientId),
      statusIdx: pgIndex('client_payments_status_idx').on(table.status),
    }))
  : sqliteTable('client_payments', {
      id: sqText('id').primaryKey(),
      clientId: sqText('client_id').notNull().references(() => clients.id, { onDelete: 'cascade' }),
      userId: sqText('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
      amount: sqReal('amount').notNull(),
      paymentDate: sqInteger('payment_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
      status: sqText('status', { enum: ['UNUSED', 'USED'] }).notNull().default('UNUSED'),
      notes: sqText('notes'),
      createdAt: sqInteger('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    }, (table) => ({
      userIdIdx: sqIndex('client_payments_user_id_idx').on(table.userId),
      clientIdIdx: sqIndex('client_payments_client_id_idx').on(table.clientId),
      statusIdx: sqIndex('client_payments_status_idx').on(table.status),
    }));
