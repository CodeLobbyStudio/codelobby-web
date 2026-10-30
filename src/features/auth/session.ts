/** Temporary handoff for #16. Profile verification and session lifecycle belong to #17. */
let accessToken: string | null = null;
const listeners = new Set<() => void>();

export const session = {
  login(token: string) {
    accessToken = token;
    listeners.forEach((listener) => listener());
  },
  logout() {
    accessToken = null;
    listeners.forEach((listener) => listener());
  },
  getAccessToken() {
    return accessToken;
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
