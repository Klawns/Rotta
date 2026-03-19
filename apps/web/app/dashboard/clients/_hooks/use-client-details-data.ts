"use client";

import { useState, useEffect, useCallback } from "react";
import { clientService, ClientBalance, Client } from "../_services/client-service";
import { rideService, Ride } from "../_services/ride-service";
import { PDFService } from "@/services/pdf-service";
import { useAuth } from "@/hooks/use-auth";

export function useClientDetailsData(client: Client | null) {
    const [rides, setRides] = useState<Ride[]>([]);
    const [balance, setBalance] = useState<ClientBalance | null>(null);
    const [payments, setPayments] = useState<any[]>([]);
    
    // Ride Pagination
    const [ridePage, setRidePage] = useState(1);
    const [rideTotal, setRideTotal] = useState(0);
    const rideLimit = 5;

    const { user } = useAuth();

    const fetchRides = useCallback(async (page: number) => {
        if (!client) return;
        try {
            const result = await rideService.fetchClientRides(client.id, {
                limit: rideLimit,
                offset: (page - 1) * rideLimit
            });
            setRides(result.rides);
            setRideTotal(result.total);
        } catch (err) {
            console.error("Erro ao buscar corridas", err);
        }
    }, [client]);

    const fetchBalance = useCallback(async () => {
        if (!client) return;
        try {
            const data = await clientService.fetchClientBalance(client.id);
            setBalance(data);
        } catch (err) {
            console.error("Erro ao buscar saldo", err);
        }
    }, [client]);

    const fetchPayments = useCallback(async () => {
        if (!client) return;
        try {
            const data = await clientService.fetchClientPayments(client.id);
            setPayments(data);
        } catch (err) {
            console.error("Erro ao buscar pagamentos", err);
        }
    }, [client]);

    const refreshDetails = useCallback(() => {
        if (client) {
            fetchRides(ridePage);
            fetchBalance();
            fetchPayments();
        }
    }, [client, ridePage, fetchRides, fetchBalance, fetchPayments]);

    useEffect(() => {
        if (client) {
            setRidePage(1);
            fetchRides(1);
            fetchBalance();
            fetchPayments();
        }
    }, [client, fetchRides, fetchBalance, fetchPayments]);

    useEffect(() => {
        if (client && ridePage > 1) {
            fetchRides(ridePage);
        }
    }, [ridePage, client, fetchRides]);

    const generatePDF = async () => {
        if (!client || !balance) return;
        try {
            const ridesForReport = await rideService.fetchRidesForReport(client.id);
            PDFService.generateClientDebtReport(
                client,
                ridesForReport,
                payments,
                balance,
                { userName: user?.name || "Motorista" }
            );
        } catch (err) {
            alert("Erro ao gerar PDF.");
        }
    };

    return {
        rides,
        balance,
        payments,
        ridePage,
        setRidePage,
        rideTotal,
        rideLimit,
        refreshDetails,
        generatePDF
    };
}
