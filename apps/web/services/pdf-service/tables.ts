import autoTable from 'jspdf-autotable';
import { type ClientPayment } from '@/types/client-payments';
import { formatResolvedDateValue } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';
import { formatDebtValue, formatRideValue, resolveRideDate } from './formatters';
import { type AutoTableDoc, type PDFReportRide } from './types';

function buildEmptyRideTableBody() {
  return [
    [
      {
        content: 'Nenhuma corrida encontrada para este filtro.',
        colSpan: 5,
        styles: {
          halign: 'center',
          fontStyle: 'italic',
          textColor: [100, 116, 139],
          fillColor: [248, 250, 252],
        },
      },
    ],
  ];
}

export function drawRidesTable(doc: AutoTableDoc, currentY: number, rides: PDFReportRide[]) {
  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Cliente', 'Local', 'Valor', 'Status']],
    body: rides.length
      ? rides.map((ride) => [
          formatResolvedDateValue(resolveRideDate(ride), null, 'dd/MM/yy HH:mm'),
          ride.clientName || ride.client?.name || '---',
          ride.location || '---',
          formatRideValue(ride),
          ride.paymentStatus === 'PAID' ? 'Pago' : 'Pendente',
        ])
      : buildEmptyRideTableBody(),
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
}

export function drawPaymentsTable(
  doc: AutoTableDoc,
  currentY: number,
  payments: ClientPayment[],
) {
  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Valor', 'Observacao']],
    body: payments.map((payment) => [
      formatResolvedDateValue(payment.paymentDate, payment.createdAt, 'dd/MM/yyyy'),
      formatCurrency(payment.amount),
      payment.notes || '---',
    ]),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 9 },
  });

  return ((doc as AutoTableDoc).lastAutoTable?.finalY ?? currentY) + 15;
}

export function drawPendingRidesTable(
  doc: AutoTableDoc,
  currentY: number,
  rides: PDFReportRide[],
) {
  autoTable(doc, {
    startY: currentY,
    head: [['Data', 'Local', 'Valor']],
    body: rides.length
      ? rides.map((ride) => [
          formatResolvedDateValue(resolveRideDate(ride), null, 'dd/MM/yy HH:mm'),
          ride.location || '---',
          formatDebtValue(ride),
        ])
      : [
          [
            {
              content: 'Nenhuma corrida pendente encontrada para este cliente.',
              colSpan: 3,
              styles: {
                halign: 'center',
                fontStyle: 'italic',
                textColor: [100, 116, 139],
                fillColor: [248, 250, 252],
              },
            },
          ],
        ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255 },
    styles: { fontSize: 9 },
  });
}
