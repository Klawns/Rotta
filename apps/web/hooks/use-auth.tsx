"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/services/api";

interface User {
    id: string;
    email: string;
    name: string;
    role: "admin" | "user";
    taxId?: string;
    cellphone?: string;
    hasSeenTutorial: boolean;
    subscription?: {
        plan: "starter" | "premium" | "lifetime";
        status: "active" | "inactive" | "canceled" | "trial" | "expired";
        validUntil: string | null;
        rideCount?: number;
    } | null;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (user: User, redirectTo?: string) => void;
    updateUser: (user: User) => void;
    logout: () => void;
    verify: () => Promise<User | null>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            const response = await api.get("/auth/me", { _skipRedirect: true } as any);
            setUser(response.data);
            return response.data;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const login = (userData: User, redirectTo?: string) => {
        setUser(userData);
        router.push(redirectTo || "/dashboard");
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    const verify = async () => {
        return fetchProfile();
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, updateUser, logout, verify, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
