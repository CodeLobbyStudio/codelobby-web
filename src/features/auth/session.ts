import { useSyncExternalStore } from 'react';
import { ApiError } from '../../shared/api/http';
import { getProfile, type UserProfile } from './api/profileApi';

type SessionState =
  | { status: 'anonymous' | 'initializing' | 'unavailable' }
  | { status: 'authenticated'; user: UserProfile };

const storageKey = 'codelobby.accessToken';

function readStoredToken() {
  try {
    return window.sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function storeToken(token: string | null) {
  try {
    if (token) window.sessionStorage.setItem(storageKey, token);
    else window.sessionStorage.removeItem(storageKey);
  } catch {
    // If storage is unavailable, the active session still works in memory.
  }
}

const anonymous: SessionState = { status: 'anonymous' };
let state: SessionState = readStoredToken()
  ? { status: 'initializing' }
  : anonymous;
let accessToken: string | null = null;
let verification: AbortController | null = null;
const listeners = new Set<() => void>();

function setState(next: SessionState) {
  state = next;
  listeners.forEach((listener) => listener());
}

async function verify(token: string, restoring: boolean, signal?: AbortSignal) {
  verification?.abort();
  const controller = new AbortController();
  verification = controller;
  const requestSignal = signal
    ? AbortSignal.any([signal, controller.signal])
    : controller.signal;
  accessToken = null;
  setState({ status: 'initializing' });
  try {
    const user = await getProfile(token, requestSignal);
    requestSignal.throwIfAborted();
    accessToken = token;
    storeToken(token);
    setState({ status: 'authenticated', user });
  } catch (error) {
    const rejected = error instanceof ApiError && error.status === 401;
    if (verification === controller) {
      if (restoring && !rejected) {
        setState({ status: 'unavailable' });
      } else {
        storeToken(null);
        setState(anonymous);
      }
    }
    if (rejected) {
      throw new ApiError('SESSION_REJECTED', error.status);
    }
    throw error;
  } finally {
    if (verification === controller) verification = null;
  }
}

export const session = {
  login(token: string, signal?: AbortSignal) {
    return verify(token, false, signal);
  },
  async restore() {
    if (
      verification ||
      (state.status !== 'initializing' && state.status !== 'unavailable')
    )
      return;
    const token = readStoredToken();
    if (!token) {
      setState(anonymous);
      return;
    }
    try {
      await verify(token, true);
    } catch {
      // The session snapshot exposes the outcome to the UI.
    }
  },
  logout() {
    verification?.abort();
    verification = null;
    accessToken = null;
    storeToken(null);
    setState(anonymous);
  },
  getAccessToken() {
    return accessToken;
  },
  getCurrentUser() {
    return state.status === 'authenticated' ? state.user : null;
  },
  getSnapshot() {
    return state;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useSession() {
  return useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    () => anonymous,
  );
}
