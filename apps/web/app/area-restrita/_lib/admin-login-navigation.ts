interface AdminSessionGateRedirectOptions {
  isRedirectingAfterSubmit: boolean;
  redirectTo: string | null;
}

interface AdminLoginPendingStateOptions {
  isCheckingSession: boolean;
  isRedirectingAfterSubmit: boolean;
}

export function shouldRedirectWithAdminSessionGate({
  isRedirectingAfterSubmit,
  redirectTo,
}: AdminSessionGateRedirectOptions) {
  return !isRedirectingAfterSubmit && redirectTo !== null;
}

export function getAdminLoginPendingState({
  isCheckingSession,
  isRedirectingAfterSubmit,
}: AdminLoginPendingStateOptions) {
  return isCheckingSession || isRedirectingAfterSubmit;
}
