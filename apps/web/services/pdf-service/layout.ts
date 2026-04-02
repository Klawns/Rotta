import jsPDF from 'jspdf';

export async function drawHeaderBrand(doc: jsPDF) {
  const img = new Image();
  img.src = '/assets/logo8.jpg';

  await new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });

  const rightMargin = 196;

  if (img.complete && img.naturalWidth > 0) {
    doc.addImage(img, 'JPEG', rightMargin - 10, 10, 10, 10);
  } else {
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(rightMargin - 10, 10, 10, 10, 2, 2, 'F');
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Rotta', rightMargin - 12, 16, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Gestao de Entregas', rightMargin - 12, 20, {
    align: 'right',
  });
}

export function drawDivider(doc: jsPDF, currentY: number) {
  doc.setDrawColor(226, 232, 240);
  doc.line(14, currentY + 2, 196, currentY + 2);
  return currentY + 12;
}

export function drawPixKey(doc: jsPDF, pixKey: string, currentY: number) {
  return drawInfoBox(doc, `Chave PIX para pagamento: ${pixKey}`, currentY, {
    fill: [236, 253, 245],
    stroke: [16, 185, 129],
    text: [5, 150, 105],
  });
}

export function drawInfoBox(
  doc: jsPDF,
  message: string,
  currentY: number,
  colors: {
    fill: [number, number, number];
    stroke: [number, number, number];
    text: [number, number, number];
  } = {
    fill: [248, 250, 252],
    stroke: [148, 163, 184],
    text: [71, 85, 105],
  },
) {
  const nextY = currentY + 3;
  const wrappedMessage = doc.splitTextToSize(message, 176);
  const height = Math.max(10, wrappedMessage.length * 5 + 4);
  doc.setFillColor(...colors.fill);
  doc.setDrawColor(...colors.stroke);
  doc.rect(14, nextY - 5, 182, height, 'FD');
  doc.setTextColor(...colors.text);
  doc.setFont('helvetica', 'bold');
  doc.text(wrappedMessage, 17, nextY + 2);
  doc.setFont('helvetica', 'normal');
  return nextY + height;
}

export function drawFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Rotta - Sistema de Gestao para Motoristas | Pagina ${page} de ${pageCount}`,
      14,
      285,
    );
  }
}
