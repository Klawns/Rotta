import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bike, User, DollarSign, Check, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Client } from "../../clients/hooks/use-clients"

const PRESET_VALUES = [10, 12, 15, 20, 25, 30]

interface AddRideFormProps {
    selectedClient: Client | null
    onAdd: (name: string, value: number) => void
    onClearSelection: () => void
}

export function AddRideForm({
    selectedClient,
    onAdd,
    onClearSelection,
}: AddRideFormProps) {
    const [selectedValue, setSelectedValue] = useState<number | null>(null)
    const [customValue, setCustomValue] = useState("")
    const [showCustomInput, setShowCustomInput] = useState(false)

    const handleSelectValue = (value: number) => {
        setSelectedValue(value)
        setShowCustomInput(false)
        setCustomValue("")
    }

    const handleCustomValueConfirm = () => {
        const numericValue = parseFloat(customValue.replace(",", "."))
        if (!isNaN(numericValue) && numericValue > 0) {
            setSelectedValue(numericValue)
            setShowCustomInput(false)
        }
    }

    const handleCustomKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleCustomValueConfirm()
        } else if (e.key === "Escape") {
            setShowCustomInput(false)
            setCustomValue("")
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedClient && selectedValue && selectedValue > 0) {
            onAdd(selectedClient.name, selectedValue)
            setSelectedValue(null)
            setCustomValue("")
            setShowCustomInput(false)
            onClearSelection()
        }
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Bike className="h-5 w-5 text-primary" />
                    Nova Corrida
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {selectedClient ? (
                        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <User className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground flex-1">
                                {selectedClient.name}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClearSelection}
                                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                            >
                                Trocar
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg border border-border">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                Selecione um cliente acima
                            </span>
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Valor da corrida
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESET_VALUES.map((value) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={selectedValue === value ? "default" : "secondary"}
                                    className={`h-12 text-sm font-bold transition-all px-2 ${selectedValue === value
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            : "bg-secondary hover:bg-secondary/80 text-foreground"
                                        }`}
                                    onClick={() => handleSelectValue(value)}
                                >
                                    R${value}
                                </Button>
                            ))}

                            {showCustomInput ? (
                                <div className="col-span-3 flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">R$</span>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="0,00"
                                            value={customValue}
                                            onChange={(e) => setCustomValue(e.target.value)}
                                            onKeyDown={handleCustomKeyDown}
                                            autoFocus
                                            className="h-12 pl-9 text-sm font-bold bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleCustomValueConfirm}
                                        disabled={!customValue}
                                        className="h-12 px-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant={selectedValue && !PRESET_VALUES.includes(selectedValue) ? "default" : "outline"}
                                    className={`col-span-3 h-12 text-sm font-bold border-dashed border-2 transition-all ${selectedValue && !PRESET_VALUES.includes(selectedValue)
                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                                            : "border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
                                        }`}
                                    onClick={() => setShowCustomInput(true)}
                                >
                                    {selectedValue && !PRESET_VALUES.includes(selectedValue) ? (
                                        `R$${selectedValue.toFixed(2).replace(".", ",")}`
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-1" />
                                            Outro valor
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={!selectedClient || !selectedValue}
                        className="w-full h-14 text-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Salvar Corrida
                        {selectedValue && (
                            <span className="ml-2 opacity-90">
                                ({formatCurrency(selectedValue)})
                            </span>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
