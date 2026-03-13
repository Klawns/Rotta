import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Bike, User, DollarSign, Check, Plus, Camera, Trash2, FileText, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Client } from "../../clients/hooks/use-clients"

const PRESET_VALUES = [10, 12, 15, 20, 25, 30]

interface AddRideFormProps {
    selectedClient: Client | null
    onAdd: (name: string, value: number, rideDate?: string) => void
    onClearSelection: () => void
}

export function AddRideForm({
    selectedClient,
    onAdd,
    onClearSelection,
}: AddRideFormProps) {
    const [selectedValue, setSelectedValue] = useState<number | null>(null)
    const [customValue, setCustomValue] = useState("")
    const [rideDate, setRideDate] = useState("")
    const [notes, setNotes] = useState("")
    const [photo, setPhoto] = useState<string | null>(null)
    const [showCustomInput, setShowCustomInput] = useState(false)

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhoto(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

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
            onAdd(selectedClient.name, selectedValue, rideDate || undefined)
            setSelectedValue(null)
            setCustomValue("")
            setRideDate("")
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

                    <div className="space-y-3">
                        <label className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Data da corrida
                            <span className="text-[10px] lowercase italic opacity-50">(opcional)</span>
                        </label>
                        <Input
                            type="datetime-local"
                            value={rideDate}
                            onChange={(e) => setRideDate(e.target.value)}
                            className="h-12 bg-secondary border-border text-foreground [color-scheme:dark]"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Observações & Foto
                                <span className="text-[10px] lowercase italic opacity-50">(opcional)</span>
                            </p>

                            <label className="flex items-center gap-1 px-2 py-1 bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-md text-primary cursor-pointer transition-colors active:scale-95 group">
                                <Camera size={14} className="group-hover:rotate-12 transition-transform" />
                                <span className="text-[10px] font-black uppercase tracking-wider">Tirar Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handlePhotoChange}
                                />
                            </label>
                        </div>

                        <div className="space-y-3">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Deixar na portaria, troco..."
                                rows={2}
                                className="w-full bg-secondary border border-border rounded-xl py-3 px-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground text-sm min-h-[80px]"
                            />

                            <AnimatePresence>
                                {photo && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative inline-block group/photo"
                                    >
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shadow-lg">
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setPhoto(null)}
                                                    className="p-1 bg-destructive rounded text-destructive-foreground shadow-lg"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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
