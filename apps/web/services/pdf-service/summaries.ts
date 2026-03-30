import jsPDF from 'jspdf';
import { type ClientBalance } from '@/types/rides';
import { formatCurrency } from '@/lib/utils';
import { calculateRevenueTotals } from './formatters';
import { type PDFReportRide } from './types';

export function drawRevenueSummary(doc: jsPDF, currentY: number, rides: PDFReportRide[]) {
  const { totalValue, totalPaid, totalPending } = calculateRevenueTotals(rides);

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Resumo Financeiro:', 14, currentY);
  currentY += 7;

  doc.setFontSize(10);
  doc.text(`Total de corridas realizadas: ${rides.length}`, 14, currentY);
  currentY += 5;
  doc.text(`Valor total bruto (corridas): ${formatCurrency(totalValue)}`, 14, currentY);
  currentY += 5;

  doc.setTextColor(220, 38, 38);
  doc.text(
    `Total de dividas pendentes (em haver): ${formatCurrency(totalPending)}`,
    14,
    currentY,
  );
  currentY += 7;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Total Faturado (Recebido): ${formatCurrency(totalPaid)}`, 14, currentY);
  doc.setFont('helvetica', 'normal');

  return currentY + 10;
}

export function drawClientDebtSummary(
  doc: jsPDF,
  currentY: number,
  balance: ClientBalance,
) {
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text('Resumo Financeiro:', 14, currentY);
  currentY += 7;
  doc.text(`Total da divida: ${formatCurrency(balance.totalDebt)}`, 14, currentY);
  currentY += 7;
  doc.text(`Pagamentos realizados: ${formatCurrency(balance.totalPaid)}`, 14, currentY);
  currentY += 7;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220, 38, 38);
  doc.text(`Divida em haver: ${formatCurrency(balance.remainingBalance)}`, 14, currentY);
  currentY += 7;
  doc.setTextColor(5, 150, 105);
  doc.text(
    `Credito disponivel (Saldo): ${formatCurrency(balance.clientBalance)}`,
    14,
    currentY,
  );
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  return currentY + 15;
}
