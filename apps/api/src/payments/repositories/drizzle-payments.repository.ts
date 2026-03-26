import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleClient } from '../../database/database.provider';
import {
  IPaymentsRepository,
  PricingPlan,
} from '../interfaces/payments-repository.interface';

@Injectable()
export class DrizzlePaymentsRepository implements IPaymentsRepository {
  private readonly logger = new Logger(DrizzlePaymentsRepository.name);

  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleClient,
  ) {}

  private get db() {
    return this.drizzle.db;
  }

  private get schema() {
    return this.drizzle.schema;
  }

  async getPlanById(id: string): Promise<PricingPlan | undefined> {
    const [plan] = await this.db
      .select()
      .from(this.schema.pricingPlans)
      .where(eq(this.schema.pricingPlans.id, id));
    return plan;
  }

  async getAllPlans(): Promise<PricingPlan[]> {
    return this.db.select().from(this.schema.pricingPlans);
  }

  async updatePlan(
    id: string,
    data: Partial<PricingPlan>,
  ): Promise<PricingPlan> {
    const [updatedPlan] = await this.db
      .update(this.schema.pricingPlans)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(this.schema.pricingPlans.id, id))
      .returning();

    return updatedPlan;
  }
}

