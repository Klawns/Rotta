import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

interface StatCardProps {
    title: string
    value: number
    icon: React.ElementType
}

export function StatCard({
    title,
    value,
    icon: Icon,
}: StatCardProps) {
    return (
        <Card className="bg-card border-border">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{title}</p>
                        <p className="text-lg font-bold text-foreground">
                            {formatCurrency(value)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
