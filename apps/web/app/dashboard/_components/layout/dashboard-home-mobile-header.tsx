"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

interface DashboardHomeMobileHeaderProps {
    onOpenSidebar: () => void;
    userName?: string | null;
    title: string;
    greeting?: string | null;
}

function getFirstName(userName?: string | null) {
    const firstName = userName?.trim().split(/\s+/)[0];
    return firstName || "Motorista";
}

export function DashboardHomeMobileHeader({
    onOpenSidebar,
    userName,
    title,
    greeting,
}: DashboardHomeMobileHeaderProps) {
    const firstName = getFirstName(userName);

    return (
        <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-background/95 backdrop-blur-md lg:hidden">
            <div className="mx-auto flex w-full max-w-md items-center justify-between gap-3 px-4 py-4">
                <Link
                    href="/dashboard"
                    aria-label="Ir para o dashboard"
                    className="flex min-w-0 items-center gap-3 transition-transform active:scale-95"
                >
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-card-background shadow-sm">
                        <Image
                            src="/assets/logo8.jpg"
                            alt="Rotta Logo"
                            fill
                            priority
                            sizes="48px"
                            className="object-cover"
                        />
                    </div>

                    <div className="min-w-0">
                        {greeting ? (
                            <p className="truncate text-sm font-medium text-text-secondary">
                                {greeting === "default" ? `Ola, ${firstName}!` : greeting}
                            </p>
                        ) : null}
                        <h1 className="truncate text-[1.5rem] font-display font-extrabold tracking-tight text-primary">
                            {title}
                        </h1>
                    </div>
                </Link>

                <button
                    onClick={onOpenSidebar}
                    aria-label="Abrir menu"
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/60 text-foreground shadow-sm transition-transform active:scale-95"
                >
                    <Menu size={20} />
                </button>
            </div>
        </header>
    );
}
