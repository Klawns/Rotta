import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Check, Trash2, Plus } from "lucide-react"
import type { Client } from "../hooks/use-clients"

interface ClientSelectorProps {
    clients: Client[]
    selectedClientId: string | null
    onSelectClient: (client: Client | null) => void
    onAddClient: (name: string) => Client
    onDeleteClient: (id: string) => void
}

export function ClientSelector({
    clients,
    selectedClientId,
    onSelectClient,
    onAddClient,
    onDeleteClient,
}: ClientSelectorProps) {
    const [isAdding, setIsAdding] = useState(false)
    const [newClientName, setNewClientName] = useState("")

    const handleAddClient = () => {
        if (newClientName.trim()) {
            const newClient = onAddClient(newClientName.trim())
            onSelectClient(newClient)
            setNewClientName("")
            setIsAdding(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAddClient()
        } else if (e.key === "Escape") {
            setIsAdding(false)
            setNewClientName("")
        }
    }

    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Selecione o Cliente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-2">
                    {clients.map((client) => (
                        <div key={client.id} className="relative group">
                            <Button
                                type="button"
                                variant={selectedClientId === client.id ? "default" : "secondary"}
                                className={`w-full h-14 text-base font-medium transition-all ${selectedClientId === client.id
                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                                    }`}
                                onClick={() => onSelectClient(selectedClientId === client.id ? null : client)}
                            >
                                <span className="truncate pr-6">{client.name}</span>
                                {selectedClientId === client.id && (
                                    <Check className="h-4 w-4 absolute right-3" />
                                )}
                            </Button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteClient(client.id)
                                    if (selectedClientId === client.id) {
                                        onSelectClient(null)
                                    }
                                }}
                                className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>
                    ))}

                    {isAdding ? (
                        <div className="col-span-2">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Nome do cliente"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    className="h-14 text-base bg-secondary border-border text-foreground placeholder:text-muted-foreground"
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddClient}
                                    disabled={!newClientName.trim()}
                                    className="h-14 px-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    <Check className="h-5 w-5" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setIsAdding(false)
                                        setNewClientName("")
                                    }}
                                    className="h-14 px-4"
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            className="h-14 text-base font-medium border-dashed border-2 border-primary/50 text-primary hover:bg-primary/10 hover:border-primary"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Novo Cliente
                        </Button>
                    )}
                </div>

                {clients.length === 0 && !isAdding && (
                    <p className="text-center text-muted-foreground text-sm mt-3">
                        Adicione seu primeiro cliente
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
