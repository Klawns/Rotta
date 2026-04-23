const ADMIN_REAUTH_STORAGE_KEY = 'admin_reauth_granted';
const ADMIN_REAUTH_STORAGE_VALUE = 'true';
const ADMIN_REAUTH_STORAGE_EVENT = 'admin-reauth-storage-change';

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

export function hasAdminReauthSession() {
  return (
    getSessionStorage()?.getItem(ADMIN_REAUTH_STORAGE_KEY) ===
    ADMIN_REAUTH_STORAGE_VALUE
  );
}

function emitAdminReauthSessionChange() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_REAUTH_STORAGE_EVENT));
}

export function persistAdminReauthSession() {
  getSessionStorage()?.setItem(
    ADMIN_REAUTH_STORAGE_KEY,
    ADMIN_REAUTH_STORAGE_VALUE,
  );
  emitAdminReauthSessionChange();
}

export function clearAdminReauthSession() {
  getSessionStorage()?.removeItem(ADMIN_REAUTH_STORAGE_KEY);
  emitAdminReauthSessionChange();
}

export function subscribeToAdminReauthSession(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  const handleChange = () => callback();

  window.addEventListener(ADMIN_REAUTH_STORAGE_EVENT, handleChange);
  window.addEventListener('storage', handleChange);

  return () => {
    window.removeEventListener(ADMIN_REAUTH_STORAGE_EVENT, handleChange);
    window.removeEventListener('storage', handleChange);
  };
}

export function getAdminReauthSessionSnapshot() {
  return hasAdminReauthSession();
}
