import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearAdminReauthSession,
  hasAdminReauthSession,
  persistAdminReauthSession,
} from './admin-reauth-storage';

class SessionStorageMock implements Storage {
  private readonly store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
}

test('persists and clears the admin reauth flag in session storage', () => {
  const originalWindow = globalThis.window;
  const sessionStorage = new SessionStorageMock();
  const eventListeners = new Map<string, Set<EventListener>>();

  const mockWindow = {
    sessionStorage,
    addEventListener(type: string, listener: EventListener) {
      const listeners = eventListeners.get(type) ?? new Set<EventListener>();
      listeners.add(listener);
      eventListeners.set(type, listeners);
    },
    removeEventListener(type: string, listener: EventListener) {
      eventListeners.get(type)?.delete(listener);
    },
    dispatchEvent(event: Event) {
      eventListeners
        .get(event.type)
        ?.forEach((listener) => listener.call(mockWindow, event));
      return true;
    },
  };

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: mockWindow,
  });

  try {
    assert.equal(hasAdminReauthSession(), false);

    persistAdminReauthSession();
    assert.equal(hasAdminReauthSession(), true);

    clearAdminReauthSession();
    assert.equal(hasAdminReauthSession(), false);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});

test('falls back safely when window is unavailable', () => {
  const originalWindow = globalThis.window;

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: undefined,
  });

  try {
    assert.equal(hasAdminReauthSession(), false);
    persistAdminReauthSession();
    clearAdminReauthSession();
    assert.equal(hasAdminReauthSession(), false);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});
