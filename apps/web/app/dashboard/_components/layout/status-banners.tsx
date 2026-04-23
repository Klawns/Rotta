"use client";

import Link from "next/link";
import type { FreeTrialState } from "@/services/free-trial-service";

interface StatusBannersProps {
  isExpired: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number;
  trial: FreeTrialState;
}

export function StatusBanners({
  isExpired,
  isExpiringSoon,
  daysRemaining,
  trial,
}: StatusBannersProps) {
  const ctaHref = trial.ctaHref;
  const bannerCtaClassName =
    "shrink-0 rounded-lg bg-white px-3 py-1 text-slate-900 shadow-sm transition-colors hover:bg-white/90";

  return (
    <>
      {trial.isStarterExpired && (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-4 bg-trial-expired px-6 py-3 text-center text-sm font-bold text-primary-foreground">
          <span>
            Seu período gratuito expirou. Assine para desbloquear as
            funcionalidades.
          </span>
          <Link href={ctaHref} className={bannerCtaClassName}>
            {trial.ctaLabel}
          </Link>
        </div>
      )}

      {trial.isStarterActive && (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-4 bg-trial-active px-6 py-3 text-center text-sm font-bold text-primary-foreground">
          <span>
            Você tem {daysRemaining}{" "}
            {daysRemaining === 1 ? "dia restante" : "dias restantes"} no trial.
          </span>
          <Link href={ctaHref} className={bannerCtaClassName}>
            Assinar agora
          </Link>
        </div>
      )}

      {!trial.isStarter && isExpired && (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-4 bg-trial-expired px-6 py-3 text-center text-sm font-bold text-primary-foreground">
          <span>Sua assinatura expirou.</span>
          <Link href={ctaHref} className={bannerCtaClassName}>
            Renovar agora
          </Link>
        </div>
      )}

      {!trial.isStarter && isExpiringSoon && (
        <div className="sticky top-0 z-[60] flex items-center justify-center gap-4 bg-trial-warning px-6 py-3 text-center text-sm font-bold text-text-primary">
          <span>Sua assinatura vence em breve.</span>
          <Link href={ctaHref} className={bannerCtaClassName}>
            Assinar agora
          </Link>
        </div>
      )}
    </>
  );
}
