import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';
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

const FINANCE_DASHBOARD_CACHE_TTL_SECONDS = 60;

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private readonly financeSummaryService: FinanceSummaryService,
    private readonly financeTrendsService: FinanceTrendsService,
    private readonly financeBreakdownService: FinanceBreakdownService,
    @Inject(CACHE_PROVIDER) private readonly cache: ICacheProvider,
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

  private getDashboardCacheKey(
    userId: string,
    query: GetFinanceStatsDto,
    startDate: Date,
    endDate: Date,
    clientId?: string,
  ) {
    const searchClientId = clientId ?? 'all';

    return [
      'finance-dashboard',
      userId,
      query.period,
      searchClientId,
      startDate.toISOString(),
      endDate.toISOString(),
    ].join(':');
  }

  async getDashboard(
    userId: string,
    query: GetFinanceStatsDto,
  ): Promise<FinanceDashboardResponse> {
    const { startDate, endDate, clientId } = this.resolveFilters(query);
    const cacheKey = this.getDashboardCacheKey(
      userId,
      query,
      startDate,
      endDate,
      clientId,
    );

    this.logger.debug({
      context: 'getDashboard:start',
      userId,
      period: query.period,
      clientId: clientId ?? 'all',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });

    const cachedDashboard =
      await this.cache.get<FinanceDashboardResponse>(cacheKey);

    if (cachedDashboard) {
      this.logger.debug({
        context: 'getDashboard:cache-hit',
        userId,
        period: query.period,
        clientId: clientId ?? 'all',
      });

      return cachedDashboard;
    }

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

    const dashboard = {
      summary,
      trends,
      byClient,
      byStatus,
      recentRides,
    };

    await this.cache.set(
      cacheKey,
      dashboard,
      FINANCE_DASHBOARD_CACHE_TTL_SECONDS,
    );

    this.logger.debug({
      context: 'getDashboard:success',
      userId,
      period: query.period,
      clientId: clientId ?? 'all',
      rideCount: summary.count,
      recentRideCount: recentRides.length,
    });

    return dashboard;
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
