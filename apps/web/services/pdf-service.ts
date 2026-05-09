import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { getClientExportTypeLabel } from '@/services/client-export.types';
import { getFinancePaymentStatusFilterLabel } from '@/services/finance-service';
import { type Client } from '@/types/rides';
import {
  getClientReportFileName,
  getClientReportPeriodLabel,
  getClientReportSectionTitle,
  getClientReportTitle,
  getFinancialReportFileName,
  getPeriodLabel,
} from './pdf-service/formatters';
import {
  drawDivider,
  drawFooter,
  drawHeaderBrand,
  drawPixKey,
} from './pdf-service/layout';
import {
  drawClientExportSummary,
  drawRevenueSummary,
} from './pdf-service/summaries';
import { drawClientExportTable, drawRidesTable } from './pdf-service/tables';
import {
  type AutoTableDoc,
  type ClientReportOptions,
  type ExportOptions,
  type PDFReportRide,
} from './pdf-service/types';

export type { ExportOptions, PDFReportRide } from './pdf-service/types';

export class PDFService {
  private static async buildFinancialReport(
    rides: PDFReportRide[],
    options: ExportOptions,
  ) {
    const doc = new jsPDF() as AutoTableDoc;
    const { userName, period, dateRange, pixKey, paymentStatus } = options;

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('Relatorio de Faturamento', 14, 20);

    await drawHeaderBrand(doc);

    let currentY = 32;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Motorista: ${userName}`, 14, currentY);
    currentY += 5;
    doc.text(`Periodo: ${getPeriodLabel(period, dateRange)}`, 14, currentY);
    currentY += 5;
    doc.text(
      `Status: ${getFinancePaymentStatusFilterLabel(paymentStatus ?? 'all')}`,
      14,
      currentY,
    );
    currentY += 5;
    doc.text(
      `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      14,
      currentY,
    );
    currentY += 8;

    if (pixKey) {
      currentY = drawPixKey(doc, pixKey, currentY);
    }

    currentY = drawDivider(doc, currentY);
    currentY = drawRevenueSummary(doc, currentY, rides);
    drawRidesTable(doc, currentY, rides);
    drawFooter(doc);

    return doc;
  }

  static async createFinancialReportFile(
    rides: PDFReportRide[],
    options: ExportOptions,
  ) {
    const doc = await this.buildFinancialReport(rides, options);
    const fileName = getFinancialReportFileName(
      options.period,
      options.dateRange,
      options.paymentStatus,
    );

    return new File([doc.output('blob')], fileName, {
      type: 'application/pdf',
    });
  }

  static async downloadFinancialReport(
    rides: PDFReportRide[],
    options: ExportOptions,
  ) {
    const doc = await this.buildFinancialReport(rides, options);

    doc.save(
      getFinancialReportFileName(
        options.period,
        options.dateRange,
        options.paymentStatus,
      ),
    );
  }

  static async generateReport(rides: PDFReportRide[], options: ExportOptions) {
    await this.downloadFinancialReport(rides, options);
  }

  private static async buildClientRidesReport(
    client: Client,
    rides: PDFReportRide[],
    summary: {
      totalRides: number;
      pendingRides: number;
      totalValue: number;
      totalPaid: number;
      totalPending: number;
    },
    options: ClientReportOptions,
  ) {
    const doc = new jsPDF() as AutoTableDoc;
    const { userName, type, dateRange } = options;

    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(getClientReportTitle(type), 14, 20);

    await drawHeaderBrand(doc);

    let currentY = 32;
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Motorista: ${userName}`, 14, currentY);
    currentY += 5;
    doc.text(`Cliente: ${client.name || 'Sem nome'}`, 14, currentY);
    currentY += 5;
    doc.text(`Tipo: ${getClientExportTypeLabel(type)}`, 14, currentY);
    currentY += 5;
    doc.text(`Periodo: ${getClientReportPeriodLabel(dateRange)}`, 14, currentY);
    currentY += 5;
    doc.text(`Corridas exportadas: ${rides.length}`, 14, currentY);
    currentY += 5;
    doc.text(
      `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`,
      14,
      currentY,
    );
    currentY += 8;

    currentY = drawDivider(doc, currentY);
    currentY = drawClientExportSummary(doc, currentY, summary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(getClientReportSectionTitle(type), 14, currentY);
    currentY += 7;
    drawClientExportTable(doc, currentY, rides, type);

    drawFooter(doc);
    return doc;
  }

  static async createClientRidesReportFile(
    client: Client,
    rides: PDFReportRide[],
    summary: {
      totalRides: number;
      pendingRides: number;
      totalValue: number;
      totalPaid: number;
      totalPending: number;
    },
    options: ClientReportOptions,
  ) {
    const doc = await this.buildClientRidesReport(
      client,
      rides,
      summary,
      options,
    );

    return new File(
      [doc.output('blob')],
      getClientReportFileName(client.name, options.type, options.dateRange),
      { type: 'application/pdf' },
    );
  }

  static async downloadClientRidesReport(
    client: Client,
    rides: PDFReportRide[],
    summary: {
      totalRides: number;
      pendingRides: number;
      totalValue: number;
      totalPaid: number;
      totalPending: number;
    },
    options: ClientReportOptions,
  ) {
    const doc = await this.buildClientRidesReport(
      client,
      rides,
      summary,
      options,
    );

    doc.save(
      getClientReportFileName(client.name, options.type, options.dateRange),
    );
  }

  static async generateClientRidesReport(
    client: Client,
    rides: PDFReportRide[],
    summary: {
      totalRides: number;
      pendingRides: number;
      totalValue: number;
      totalPaid: number;
      totalPending: number;
    },
    options: ClientReportOptions,
  ) {
    await this.downloadClientRidesReport(client, rides, summary, options);
  }
}
