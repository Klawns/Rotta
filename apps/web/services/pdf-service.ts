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
import {
  drawClientExportTable,
  drawRidesTable,
} from './pdf-service/tables';
import {
  type AutoTableDoc,
  type ClientReportOptions,
  type ExportOptions,
  type PDFReportRide,
} from './pdf-service/types';

export type { ExportOptions, PDFReportRide } from './pdf-service/types';

export class PDFService {
  static async generateReport(
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
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, currentY);
    currentY += 8;

    if (pixKey) {
      currentY = drawPixKey(doc, pixKey, currentY);
    }

    currentY = drawDivider(doc, currentY);
    currentY = drawRevenueSummary(doc, currentY, rides);
    drawRidesTable(doc, currentY, rides);
    drawFooter(doc);

    doc.save(getFinancialReportFileName(period, dateRange, paymentStatus));
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
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, currentY);
    currentY += 8;

    currentY = drawDivider(doc, currentY);
    currentY = drawClientExportSummary(doc, currentY, summary);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(getClientReportSectionTitle(type), 14, currentY);
    currentY += 7;
    drawClientExportTable(doc, currentY, rides, type);

    drawFooter(doc);
    doc.save(getClientReportFileName(client.name, type, dateRange));
  }
}
