import { ClientSearch } from "./client-search";
import { ClientList } from "./client-list";
import { Client } from "../_services/client-service";

interface ClientListSectionProps {
    clients: Client[];
    isLoading: boolean;
    search: string;
    onSearchChange: (value: string) => void;
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    onEdit: (client: Client) => void;
    onPin: (client: Client) => void;
    onQuickRide: (client: Client) => void;
    onViewHistory: (client: Client) => void;
}

export function ClientListSection({
    clients,
    isLoading,
    search,
    onSearchChange,
    page,
    total,
    limit,
    onPageChange,
    onEdit,
    onPin,
    onQuickRide,
    onViewHistory
}: ClientListSectionProps) {
    return (
        <>
            <ClientSearch value={search} onChange={onSearchChange} />

            <ClientList 
                clients={clients}
                isLoading={isLoading}
                page={page}
                total={total}
                limit={limit}
                onPageChange={onPageChange}
                onEdit={onEdit}
                onPin={onPin}
                onQuickRide={onQuickRide}
                onViewHistory={onViewHistory}
            />
        </>
    );
}
