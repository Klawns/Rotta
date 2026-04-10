'use client';

import { SubscriptionExpiringPopup } from '@/components/dashboard/subscription-expiring-popup';
import { TutorialModal } from '@/components/dashboard/tutorial-modal';
import type { User } from '@/hooks/use-auth';
import { useDashboardPopups } from '../../_hooks/use-dashboard-popups';

interface PopupsManagerProps {
  user: User | null;
  isLoading: boolean;
  showExpiringPopup: boolean;
  daysRemaining: number;
}

/**
 * Gerenciador de popups do dashboard.
 * Mantem a view fina e delega regras/efeitos para hooks e utilitarios dedicados.
 */
export function PopupsManager({
  user,
  isLoading,
  showExpiringPopup,
  daysRemaining,
}: PopupsManagerProps) {
  const popups = useDashboardPopups({
    user,
    isLoading,
    showExpiringPopup,
    daysRemaining,
  });

  return (
    <>
      <TutorialModal
        isOpen={popups.isTutorialOpen}
        onClose={popups.handleCloseTutorial}
      />

      {popups.showExpiringPopup ? (
        <SubscriptionExpiringPopup daysRemaining={popups.daysRemaining} />
      ) : null}
    </>
  );
}
