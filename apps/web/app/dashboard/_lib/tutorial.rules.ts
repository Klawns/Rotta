import type { User } from '@/hooks/use-auth';

export interface TutorialEligibilityInput {
  user: User | null;
  isLoading: boolean;
  dismissedTutorialUserId?: string | null;
}

function hasTutorialEligibleSubscription(user: User) {
  return (
    user.subscription?.status === 'active' ||
    user.subscription?.status === 'trial'
  );
}

export function shouldShowTutorial({
  user,
  isLoading,
  dismissedTutorialUserId = null,
}: TutorialEligibilityInput) {
  if (isLoading || !user || user.role !== 'user' || user.hasSeenTutorial) {
    return false;
  }

  return (
    hasTutorialEligibleSubscription(user) &&
    dismissedTutorialUserId !== user.id
  );
}
