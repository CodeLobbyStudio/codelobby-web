import { afterEach, expect, it, vi } from 'vitest';
import { postJson } from '../src/shared/api/http';
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
it('times out a request without automatically retrying it', async () => {
  vi.useFakeTimers();
  const fetch = vi.fn(
    (_url, options) =>
      new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        );
      }),
  );
  vi.stubGlobal('fetch', fetch);
  const result = expect(
    postJson('/auth/login', {}, undefined, 100),
  ).rejects.toMatchObject({ code: 'TIMEOUT' });
  await vi.advanceTimersByTimeAsync(100);
  await result;
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('handles non-JSON failures without showing an HTML proxy error', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response('<html>Error</html>', { status: 502 })),
  );
  await expect(postJson('/auth/login', {})).rejects.toMatchObject({
    code: 'HTTP_ERROR',
    status: 502,
  });
});
