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
  const nextY = currentY + 3;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.rect(14, nextY - 5, 182, 10, 'FD');
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text(`Chave PIX para pagamento: ${pixKey}`, 17, nextY + 2);
  doc.setFont('helvetica', 'normal');
  return nextY + 10;
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
