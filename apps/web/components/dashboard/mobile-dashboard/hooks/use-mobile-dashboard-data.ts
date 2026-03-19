"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { Ride, RidePreset } from "../types";
import { RIDES_PER_PAGE } from "../constants";

export function useMobileDashboardData(user: any) {
    const [presets, setPresets] = useState<RidePreset[]>([]);
    const [isLoadingPresets, setIsLoadingPresets] = useState(true);
    
    // History
    const [recentRides, setRecentRides] = useState<Ride[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Stats (Aggregated for display)
    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        month: 0,
        monthRides: [] as Ride[]
    });

    const loadPresets = useCallback(async () => {
        try {
            setIsLoadingPresets(true);
            const { data } = await api.get("/settings/ride-presets");
            setPresets(data);
        } catch (err) {
            console.error("[MobileDashboard] Erro ao carregar presets:", err);
        } finally {
            setIsLoadingPresets(false);
        }
    }, []);

    const loadHistory = useCallback(async (page: number) => {
        try {
            setIsLoadingHistory(true);
            const { data } = await api.get(`/rides?limit=${RIDES_PER_PAGE}&offset=${page * RIDES_PER_PAGE}`);
            setRecentRides(data.rides || []);
        } catch (err) {
            console.error("[MobileDashboard] Erro ao carregar histórico:", err);
        } finally {
            setIsLoadingHistory(false);
        }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const [today, week, month] = await Promise.all([
                api.get("/rides/stats?period=today"),
                api.get("/rides/stats?period=week"),
                api.get("/rides/stats?period=month"),
            ]);
            
            setStats({
                today: today.data.totalValue || 0,
                week: week.data.totalValue || 0,
                month: month.data.totalValue || 0,
                monthRides: month.data.rides || []
            });
        } catch (err) {
            console.error("[MobileDashboard] Erro ao carregar estatísticas:", err);
        }
    }, []);

    const refreshData = useCallback(() => {
        loadStats();
        loadHistory(0);
        setHistoryPage(0);
    }, [loadStats, loadHistory]);

    useEffect(() => {
        if (user) {
            loadPresets();
            loadStats();
            loadHistory(0);
        }
    }, [user, loadPresets, loadStats, loadHistory]);

    useEffect(() => {
        if (historyPage > 0) {
            loadHistory(historyPage);
        } else if (user) {
            loadHistory(0);
        }
    }, [historyPage, loadHistory, user]);

    return {
        presets,
        setPresets,
        isLoadingPresets,
        recentRides,
        historyPage,
        setHistoryPage,
        isLoadingHistory,
        stats,
        refreshData,
        loadHistory
    };
}
