import { Injectable, Logger } from '@nestjs/common';
import { getDatesFromPeriod } from '../common/utils/date.util';
import type {
  FinanceByClientItem,
  FinanceByStatusItem,
  FinanceDashboardResponse,
  FinanceReportResponse,
  FinanceSummaryResponse,
  FinanceTrendItem,
  GetFinanceStatsDto,
  RecentRideItem,
} from './dto/finance.dto';
import { FinanceSummaryService } from './services/finance-summary.service';
import { FinanceTrendsService } from './services/finance-trends.service';
import { FinanceBreakdownService } from './services/finance-breakdown.service';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly financeSummaryService: FinanceSummaryService,
    private readonly financeTrendsService: FinanceTrendsService,
    private readonly financeBreakdownService: FinanceBreakdownService,
  ) {}

  private resolveFilters(query: GetFinanceStatsDto): {
    startDate: Date;
    endDate: Date;
    clientId?: string;
  } {
    const { startDate, endDate } = getDatesFromPeriod(
      query.period,
      query.start,
      query.end,
    );

    return {
      startDate,
      endDate,
      clientId:
        query.clientId && query.clientId !== 'all' ? query.clientId : undefined,
    };
  }

  async getDashboard(
    userId: string,
    query: GetFinanceStatsDto,
  ): Promise<FinanceDashboardResponse> {
    const { startDate, endDate, clientId } = this.resolveFilters(query);

    this.logger.debug({
      context: 'getDashboard:start',
      userId,
      period: query.period,
      clientId: clientId ?? 'all',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const [summary, trends, byClient, byStatus, recentRides] =
      (await Promise.all([
        this.financeSummaryService.getSummary(
          userId,
          startDate,
          endDate,
          query.period,
          clientId,
        ),
        this.financeTrendsService.getTrends(
          userId,
          startDate,
          endDate,
          clientId,
        ),
        this.financeBreakdownService.getByClient(userId, startDate, endDate),
        this.financeBreakdownService.getByStatus(
          userId,
          startDate,
          endDate,
          clientId,
        ),
        this.financeBreakdownService.getRecentRides(
          userId,
          startDate,
          endDate,
          clientId,
        ),
      ])) as [
        FinanceSummaryResponse,
        FinanceTrendItem[],
        FinanceByClientItem[],
        FinanceByStatusItem[],
        RecentRideItem[],
      ];

    this.logger.debug({
      context: 'getDashboard:success',
      userId,
      period: query.period,
      clientId: clientId ?? 'all',
      rideCount: summary.count,
      recentRideCount: recentRides.length,
    });

    return {
      summary,
      trends,
      byClient,
      byStatus,
      recentRides,
    };
  }

  async getReport(
    userId: string,
    query: GetFinanceStatsDto,
  ): Promise<FinanceReportResponse> {
    const { startDate, endDate, clientId } = this.resolveFilters(query);

    this.logger.debug({
      context: 'getReport:start',
      userId,
      period: query.period,
      clientId: clientId ?? 'all',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const rides = await this.financeBreakdownService.getReportRides(
      userId,
      startDate,
      endDate,
      clientId,
    );

    this.logger.debug({
      context: 'getReport:success',
      userId,
      period: query.period,
      clientId: clientId ?? 'all',
      rideCount: rides.length,
    });

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      rides,
    };
  }
}
