import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq, and, gte, lte, sql, desc, or } from 'drizzle-orm';
import { DRIZZLE } from '../database/database.provider';
import type { DrizzleClient } from '../database/database.provider';
import { getDatesFromPeriod, getDaysArray } from '../common/utils/date.util';
import { GetFinanceStatsDto } from './dto/finance.dto';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

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

  async getDashboard(userId: string, query: GetFinanceStatsDto) {
    const { startDate, endDate } = getDatesFromPeriod(query.period, query.start, query.end);
    const clientId = query.clientId && query.clientId !== 'all' ? query.clientId : undefined;

    // 1. Resumo (Total, Count, etc.)
    const summary = await this.getSummary(userId, startDate, endDate, query.period, clientId);

    // 2. Tendências (Evolução Diária)
    const trends = await this.getTrends(userId, startDate, endDate, clientId);

    // 3. Distribuição por Cliente
    const byClient = await this.getByClient(userId, startDate, endDate);

    // 4. Status de Pagamento
    const byStatus = await this.getByStatus(userId, startDate, endDate, clientId);

    // 5. Corridas Recentes (Últimas 5 para o feed)
    const recentRides = await this.getRecentRides(userId, startDate, endDate, clientId);

    return {
      summary,
      trends,
      byClient,
      byStatus,
      recentRides,
    };
  }

  private async getSummary(userId: string, start: Date, end: Date, period: string, clientId?: string) {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, start),
      lte(this.schema.rides.rideDate, end),
    ];
    if (clientId) conditions.push(eq(this.schema.rides.clientId, clientId));

    const stats = await this.db
      .select({
        count: sql<number>`count(*)`,
        total: sql<number>`coalesce(sum(${this.schema.rides.value}), 0)`,
      })
      .from(this.schema.rides)
      .where(and(...conditions));

    const currentTotal = Number(stats[0]?.total || 0);
    const currentCount = Number(stats[0]?.count || 0);
    const ticketMedio = currentCount > 0 ? currentTotal / currentCount : 0;

    // Comparação com período anterior
    const previousComparison = await this.getPreviousPeriodComparison(userId, start, end, period, clientId);

    // Projeção (apenas se for mês atual)
    const projection = this.calculateProjection(currentTotal, start, end, period);

    return {
      totalValue: currentTotal,
      count: currentCount,
      ticketMedio,
      previousPeriodComparison: previousComparison,
      projection,
    };
  }

  private async getTrends(userId: string, start: Date, end: Date, clientId?: string) {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, start),
      lte(this.schema.rides.rideDate, end),
    ];
    if (clientId) conditions.push(eq(this.schema.rides.clientId, clientId));

    const rides = await this.db
      .select({
        rideDate: this.schema.rides.rideDate,
        value: this.schema.rides.value,
      })
      .from(this.schema.rides)
      .where(and(...conditions));

    // Agrupar por data local (YYYY-MM-DD)
    const trendMap = new Map<string, number>();
    
    rides.forEach((ride: any) => {
      if (!ride.rideDate) return;
      const d = new Date(ride.rideDate);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      trendMap.set(dateKey, (trendMap.get(dateKey) || 0) + Number(ride.value || 0));
    });

    // Preencher lacunas com zero usando a mesma lógica de chave
    const allDays = getDaysArray(start, end);
    
    return allDays.map(date => ({
      date,
      value: trendMap.get(date) || 0,
    }));
  }

  private async getByClient(userId: string, start: Date, end: Date) {
    const results = await this.db
      .select({
        clientId: this.schema.rides.clientId,
        clientName: this.schema.clients.name,
        value: sql<number>`sum(${this.schema.rides.value})`,
      })
      .from(this.schema.rides)
      .leftJoin(this.schema.clients, eq(this.schema.rides.clientId, this.schema.clients.id))
      .where(
        and(
          eq(this.schema.rides.userId, userId),
          gte(this.schema.rides.rideDate, start),
          lte(this.schema.rides.rideDate, end),
        )
      )
      .groupBy(this.schema.rides.clientId, this.schema.clients.name)
      .orderBy(desc(sql`sum(${this.schema.rides.value})`))
      .limit(5);

    return results.map((r: any) => ({
      clientId: r.clientId,
      clientName: r.clientName || 'Cliente Removido',
      value: Number(r.value || 0),
    }));
  }

  private async getByStatus(userId: string, start: Date, end: Date, clientId?: string) {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, start),
      lte(this.schema.rides.rideDate, end),
    ];
    if (clientId) conditions.push(eq(this.schema.rides.clientId, clientId));

    const results = await this.db
      .select({
        status: this.schema.rides.paymentStatus,
        value: sql<number>`sum(${this.schema.rides.value})`,
      })
      .from(this.schema.rides)
      .where(and(...conditions))
      .groupBy(this.schema.rides.paymentStatus);

    return results.map((r: any) => ({
      status: r.status as 'PAID' | 'PENDING',
      value: Number(r.value || 0),
    }));
  }

  private async getRecentRides(userId: string, start: Date, end: Date, clientId?: string) {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, start),
      lte(this.schema.rides.rideDate, end),
    ];
    if (clientId) conditions.push(eq(this.schema.rides.clientId, clientId));

    return this.db
      .select({
        id: this.schema.rides.id,
        value: this.schema.rides.value,
        rideDate: this.schema.rides.rideDate,
        paymentStatus: this.schema.rides.paymentStatus,
        location: this.schema.rides.location,
        clientName: this.schema.clients.name,
      })
      .from(this.schema.rides)
      .leftJoin(this.schema.clients, eq(this.schema.rides.clientId, this.schema.clients.id))
      .where(and(...conditions))
      .orderBy(desc(this.schema.rides.rideDate))
      .limit(10);
  }

  private async getPreviousPeriodComparison(userId: string, start: Date, end: Date, period: string, clientId?: string) {
    if (period === 'custom') return 0; // Difícil comparar custom sem contexto

    const diff = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - diff - 1);
    const prevEnd = new Date(start.getTime() - 1);

    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, prevStart),
      lte(this.schema.rides.rideDate, prevEnd),
    ];
    if (clientId) conditions.push(eq(this.schema.rides.clientId, clientId));

    const stats = await this.db
      .select({
        total: sql<number>`coalesce(sum(${this.schema.rides.value}), 0)`,
      })
      .from(this.schema.rides)
      .where(and(...conditions));

    const prevTotal = Number(stats[0]?.total || 0);
    const currTotal = await this.getCurrentTotal(userId, start, end, clientId);

    if (prevTotal === 0) return currTotal > 0 ? 100 : 0;
    return ((currTotal - prevTotal) / prevTotal) * 100;
  }

  private async getCurrentTotal(userId: string, start: Date, end: Date, clientId?: string) {
    const conditions = [
      eq(this.schema.rides.userId, userId),
      gte(this.schema.rides.rideDate, start),
      lte(this.schema.rides.rideDate, end),
    ];
    if (clientId) conditions.push(eq(this.schema.rides.clientId, clientId));

    const stats = await this.db
      .select({
        total: sql<number>`coalesce(sum(${this.schema.rides.value}), 0)`,
      })
      .from(this.schema.rides)
      .where(and(...conditions));

    return Number(stats[0]?.total || 0);
  }

  private calculateProjection(currentTotal: number, start: Date, end: Date, period: string) {
    if (period !== 'month') return 0;

    const today = new Date();
    if (today > end || today < start) return 0;

    const daysPassed = today.getDate();
    const totalDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (daysPassed === 0) return 0;
    const dailyAverage = currentTotal / daysPassed;
    return dailyAverage * totalDays;
  }
}
