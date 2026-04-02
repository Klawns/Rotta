import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { FinanceSummaryService } from './services/finance-summary.service';
import { FinanceTrendsService } from './services/finance-trends.service';
import { FinanceBreakdownService } from './services/finance-breakdown.service';

type SummaryServiceMock = {
  getSummary: jest.MockedFunction<FinanceSummaryService['getSummary']>;
};

type TrendsServiceMock = {
  getTrends: jest.MockedFunction<FinanceTrendsService['getTrends']>;
};

type BreakdownServiceMock = {
  getByClient: jest.MockedFunction<FinanceBreakdownService['getByClient']>;
  getByStatus: jest.MockedFunction<FinanceBreakdownService['getByStatus']>;
  getRecentRides: jest.MockedFunction<
    FinanceBreakdownService['getRecentRides']
  >;
  getReportRides: jest.MockedFunction<
    FinanceBreakdownService['getReportRides']
  >;
};

describe('FinanceService', () => {
  let service: FinanceService;
  let summaryServiceMock: SummaryServiceMock;
  let trendsServiceMock: TrendsServiceMock;
  let breakdownServiceMock: BreakdownServiceMock;

  beforeEach(async () => {
    summaryServiceMock = {
      getSummary: jest.fn().mockResolvedValue({ totalValue: 42 }),
    };
    trendsServiceMock = {
      getTrends: jest
        .fn()
        .mockResolvedValue([{ date: '2026-03-29', value: 42 }]),
    };
    breakdownServiceMock = {
      getByClient: jest
        .fn()
        .mockResolvedValue([{ clientId: 'client-1', value: 42 }]),
      getByStatus: jest.fn().mockResolvedValue([{ status: 'PAID', value: 42 }]),
      getRecentRides: jest
        .fn()
        .mockResolvedValue([{ id: 'ride-1', value: 42 }]),
      getReportRides: jest
        .fn()
        .mockResolvedValue([{ id: 'ride-2', value: 84 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        {
          provide: FinanceSummaryService,
          useValue: summaryServiceMock,
        },
        {
          provide: FinanceTrendsService,
          useValue: trendsServiceMock,
        },
        {
          provide: FinanceBreakdownService,
          useValue: breakdownServiceMock,
        },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  it('should compose the dashboard payload from focused services', async () => {
    const result = await service.getDashboard('user-1', {
      period: 'month',
      clientId: 'all',
    });

    expect(summaryServiceMock.getSummary).toHaveBeenCalled();
    expect(trendsServiceMock.getTrends).toHaveBeenCalled();
    expect(breakdownServiceMock.getByClient).toHaveBeenCalled();
    expect(breakdownServiceMock.getByStatus).toHaveBeenCalled();
    expect(breakdownServiceMock.getRecentRides).toHaveBeenCalled();
    expect(result).toEqual({
      summary: { totalValue: 42 },
      trends: [{ date: '2026-03-29', value: 42 }],
      byClient: [{ clientId: 'client-1', value: 42 }],
      byStatus: [{ status: 'PAID', value: 42 }],
      recentRides: [{ id: 'ride-1', value: 42 }],
    });
  });

  it('should return the full report payload for the selected filter', async () => {
    const result = await service.getReport('user-1', {
      period: 'custom',
      start: '2026-03-01',
      end: '2026-03-31',
      clientId: 'client-1',
    });
    const [userId, startDate, endDate, clientId] =
      breakdownServiceMock.getReportRides.mock.calls[0];

    expect(breakdownServiceMock.getReportRides).toHaveBeenCalled();
    expect(userId).toBe('user-1');
    expect(clientId).toBe('client-1');
    expect(startDate.toISOString()).toBe(
      new Date(2026, 2, 1, 0, 0, 0, 0).toISOString(),
    );
    expect(endDate.toISOString()).toBe(
      new Date(2026, 2, 31, 23, 59, 59, 999).toISOString(),
    );
    expect(result.rides).toEqual([{ id: 'ride-2', value: 84 }]);
    expect(result.period.start).toBe(startDate.toISOString());
    expect(result.period.end).toBe(endDate.toISOString());
  });
});
