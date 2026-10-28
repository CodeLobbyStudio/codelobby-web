import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('API base URL configuration', () => {
  it('defaults to the same-origin API when no value is configured', async () => {
    vi.stubEnv('VITE_API_BASE_URL', undefined);
    const { apiBaseUrl } = await import('../src/shared/api/config');
    expect(apiBaseUrl).toBe('/api');
  });

  it('defaults to the same-origin API for an empty value', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');
    const { apiBaseUrl } = await import('../src/shared/api/config');
    expect(apiBaseUrl).toBe('/api');
  });

  it.each(['/gateway/api', 'https://api.example.com/api'])(
    'uses the configured URL %s',
    async (url) => {
      vi.stubEnv('VITE_API_BASE_URL', url);
      const { apiBaseUrl } = await import('../src/shared/api/config');
      expect(apiBaseUrl).toBe(url);
    },
  );
});
