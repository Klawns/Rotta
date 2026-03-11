import { users, subscriptions } from '@mdc/database';

export const IAdminRepository = Symbol('IAdminRepository');

export interface IAdminRepository {
  getUsersCount(adminEmail: string): Promise<number>;
  getActiveSubscriptionsCount(): Promise<number>;
  getRecentUsers(
    adminEmail: string,
    limit: number,
    offset: number,
  ): Promise<{
    data: Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      createdAt: Date;
      plan: string | null;
    }>;
    total: number;
  }>;
  deleteUser(id: string): Promise<void>;
}
