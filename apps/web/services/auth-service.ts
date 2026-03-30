/**
 * Simple authentication service for handling unauthorized signals from
 * environment-agnostic code (like interceptors) to reactive UI components.
 */
type UnauthCallback = () => void;

class AuthService {
    private subscribers: Set<UnauthCallback> = new Set();
    private isRedirecting = false;

    /**
     * Subscribe to unauthorized events.
     * @returns Unsubscribe function.
     */
    subscribe(callback: UnauthCallback): () => void {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notifies all subscribers about an unauthorized status.
     * Prevents multiple notifications if a redirect is already pending.
     */
    notifyUnauthorized(): void {
        if (this.isRedirecting) return;
        
        this.isRedirecting = true;
        this.subscribers.forEach((cb) => cb());
    }

    /**
     * Resets the redirect lock.
     * Should be called after successful login or redirect completion.
     */
    resetRedirectLock(): void {
        this.isRedirecting = false;
    }
}

// Single instance to be shared across the client application
export const authService = new AuthService();
