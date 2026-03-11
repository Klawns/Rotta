import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "@/lib/utils";

interface ExportOptions {
    clients?: string[]; // IDs
    period: 'today' | 'week' | 'month' | 'year' | 'custom';
    userName: string;
}

export class PDFService {
    static async generateReport(rides: any[], options: ExportOptions) {
        const doc = new jsPDF();
        const { userName, period } = options;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text("Relatório de Faturamento", 14, 22);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // Slate 500
        doc.text(`Motorista: ${userName}`, 14, 30);
        doc.text(`Período: ${this.getPeriodLabel(period)}`, 14, 35);
        doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 40);

        // Stats Summary
        const totalValue = rides.reduce((sum, r) => sum + r.value, 0);
        const totalRides = rides.length;

        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(14, 45, 196, 45);

        doc.setFontSize(12);
        doc.setTextColor(30, 41, 59);
        doc.text("Resumo:", 14, 55);
        doc.text(`Total de Corridas: ${totalRides}`, 14, 62);
        doc.setFont("helvetica", "bold");
        doc.text(`Total Faturado: ${formatCurrency(totalValue)}`, 14, 69);
        doc.setFont("helvetica", "normal");

        // Table
        const tableData = rides.map(ride => [
            format(new Date(ride.createdAt || ride.rideDate), "dd/MM/yy HH:mm"),
            ride.client?.name || "---",
            ride.location || "---",
            formatCurrency(ride.value),
            ride.paymentStatus === 'PAID' ? "PAGO" : "PENDENTE"
        ]);

        autoTable(doc, {
            startY: 80,
            head: [['Data', 'Cliente', 'Local', 'Valor', 'Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246], textColor: 255 }, // Blue 500
            alternateRowStyles: { fillColor: [248, 250, 252] }, // Slate 50
            margin: { top: 80 },
        });

        // Footer
        const pageCount = (doc.internal as any).getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(`MDC App - Sistema de Gestão para Motoristas | Página ${i} de ${pageCount}`, 14, 285);
        }

        doc.save(`Relatorio_${period}_${format(new Date(), "ddMMyyyy")}.pdf`);
    }

    private static getPeriodLabel(period: string) {
        switch (period) {
            case 'today': return "Hoje";
            case 'week': return "Esta Semana";
            case 'month': return "Este Mês";
            case 'year': return "Este Ano";
            case 'custom': return "Personalizado";
            default: return period;
        }
    }
}
