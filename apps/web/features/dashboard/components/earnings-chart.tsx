import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { formatCurrency } from "@/lib/utils"

interface EarningsChartProps {
    data: { day: string; date: string; total: number; corridas: number }[]
}

export function EarningsChart({ data }: EarningsChartProps) {
    const primaryColor = "#22c55e"

    if (data.every(d => d.total === 0)) {
        return (
            <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Ganhos - Últimos 7 dias
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                            <TrendingUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                            <p>Sem dados para exibir</p>
                            <p className="text-sm">Adicione corridas para ver o gráfico</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Ganhos - Últimos 7 dias
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <XAxis
                                dataKey="day"
                                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                                axisLine={{ stroke: "#3f3f46" }}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: "#a1a1aa", fontSize: 12 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `R$${value}`}
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload
                                        return (
                                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                                <p className="text-sm font-medium text-foreground">{data.day} - {data.date}</p>
                                                <p className="text-sm text-primary font-bold">{formatCurrency(data.total)}</p>
                                                <p className="text-xs text-muted-foreground">{data.corridas} corrida{data.corridas !== 1 ? 's' : ''}</p>
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Bar
                                dataKey="total"
                                fill={primaryColor}
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
