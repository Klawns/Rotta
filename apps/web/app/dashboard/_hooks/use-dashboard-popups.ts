'use client';

import { useState } from 'react';

import type { User } from '@/hooks/use-auth';
import { shouldShowTutorial } from '../_lib/tutorial.rules';
import { useMarkTutorialSeen } from './use-mark-tutorial-seen';

interface UseDashboardPopupsOptions {
  user: User | null;
  isLoading: boolean;
  showExpiringPopup: boolean;
  daysRemaining: number;
}

export function useDashboardPopups({
  user,
  isLoading,
  showExpiringPopup,
  daysRemaining,
}: UseDashboardPopupsOptions) {
  const [dismissedTutorialUserId, setDismissedTutorialUserId] = useState<
    string | null
  >(null);

  const { markTutorialSeen, isMarkingTutorialSeen } = useMarkTutorialSeen({
    onError: () => {
      setDismissedTutorialUserId(null);
    },
  });

  const isTutorialOpen = shouldShowTutorial({
    user,
    isLoading,
    dismissedTutorialUserId,
  });

  const handleCloseTutorial = () => {
    if (!user || isMarkingTutorialSeen) {
      return;
    }

    setDismissedTutorialUserId(user.id);
    markTutorialSeen();
  };

  return {
    daysRemaining,
    handleCloseTutorial,
    isTutorialOpen,
    showExpiringPopup,
  };
}
