import React from "react";
import { Wallet, ArrowRight } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface PaymentCompositionProps {
    totalValue: number;
    paidWithBalance?: number;
    debtValue?: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
    align?: "start" | "center" | "end";
    compact?: boolean;
}

export function PaymentComposition({
    totalValue,
    paidWithBalance = 0,
    debtValue,
    size = "md",
    showLabel = true,
    className,
    align = "end",
    compact = false
}: PaymentCompositionProps) {
    const hasBalance = paidWithBalance > 0;
    const finalDebt = debtValue !== undefined ? debtValue : (totalValue - paidWithBalance);
    
    const alignmentClasses = {
        start: "items-start text-start",
        center: "items-center text-center",
        end: "items-end text-end"
    };

    if (!hasBalance) {
        return (
            <div className={cn("flex flex-col", alignmentClasses[align], className)}>
                <p className={cn(
                    "font-display font-black tracking-tighter text-text-primary",
                    size === "sm" ? "text-base" : size === "md" ? "text-xl" : "text-3xl"
                )}>
                    {formatCurrency(totalValue)}
                </p>
                {showLabel && (
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 -mt-0.5">
                        Total
                    </span>
                )}
            </div>
        );
    }

    // Version with Balance
    return (
        <div className={cn(
            "flex",
            compact ? "flex-col items-end" : "flex-col gap-1",
            alignmentClasses[align], 
            className
        )}>
            {!compact ? (
                <>
                    {/* Original Total (Muted) */}
                    <div className="flex items-center gap-1.5 opacity-40">
                        <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Original</span>
                        <span className="text-[10px] font-bold leading-none">{formatCurrency(totalValue)}</span>
                    </div>

                    {/* Discount / Balance Info */}
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-brand/5 border border-brand/10 rounded-lg">
                        <Wallet size={10} className="text-brand" />
                        <span className="text-[8px] font-bold text-brand uppercase tracking-widest leading-none">
                            -{formatCurrency(paidWithBalance)} saldo
                        </span>
                    </div>

                    {/* Final Debt */}
                    <div className={cn("flex flex-col mt-0.5", alignmentClasses[align])}>
                        <p className={cn(
                            "font-display font-black tracking-tighter leading-none",
                            finalDebt > 0 ? "text-destructive" : "text-success",
                            size === "sm" ? "text-base leading-tight" : size === "md" ? "text-xl leading-tight" : "text-3xl leading-tight"
                        )}>
                            {formatCurrency(finalDebt)}
                        </p>
                        {showLabel && (
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 mt-1 leading-none whitespace-nowrap">
                                {finalDebt > 0 ? "Dívida em Aberto" : "Quitada com Saldo"}
                            </span>
                        )}
                    </div>
                </>
            ) : (
                <div className={cn("flex flex-col", alignmentClasses[align])}>
                    <div className="flex items-center gap-1 opacity-20 scale-90 origin-right mb-[-2px]">
                        <span className="text-[10px] font-bold line-through">
                            {formatCurrency(totalValue)}
                        </span>
                    </div>
                    <p className={cn(
                        "font-black tracking-tight leading-none",
                        finalDebt > 0 ? "text-destructive" : "text-success",
                        size === "sm" ? "text-sm" : "text-base"
                    )}>
                        {formatCurrency(finalDebt)}
                    </p>
                </div>
            )}
        </div>
    );
}
