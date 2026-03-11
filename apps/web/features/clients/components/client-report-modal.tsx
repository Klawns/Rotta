import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Ride } from "../../rides/hooks/use-rides"

interface ClientReportModalProps {
    isOpen: boolean
    onClose: () => void
    clientName: string
    rides: Ride[]
    onGeneratePDF: (clientName: string, rides: Ride[]) => void
}

export function ClientReportModal({
    isOpen,
    onClose,
    clientName,
    rides,
    onGeneratePDF,
}: ClientReportModalProps) {
    const total = rides.reduce((sum, ride) => sum + ride.value, 0)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        Relatório - {clientName}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 py-2">
                    <div className="bg-secondary rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-muted-foreground">Total de corridas</p>
                                <p className="text-2xl font-bold text-foreground">{rides.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Valor total</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Corridas</p>
                        {rides.map((ride) => (
                            <div
                                key={ride.id}
                                className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg"
                            >
                                <span className="text-sm text-muted-foreground">
                                    {formatDate(ride.createdAt)}
                                </span>
                                <span className="font-semibold text-primary">
                                    {formatCurrency(ride.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t border-border">
                    <Button
                        onClick={() => onGeneratePDF(clientName, rides)}
                        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                        <FileText className="h-5 w-5 mr-2" />
                        Gerar PDF / Imprimir
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
