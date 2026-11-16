import { apiBaseUrl } from './config';

export type ApiErrorResponse = {
  code: string;
  message: string;
  timestamp: string;
};

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly status = 0,
    message = code,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function postJson(
  path: string,
  body: unknown,
  signal?: AbortSignal,
  timeoutMs = 15000,
  token?: string,
) {
  return requestJson(path, { method: 'POST', body, token }, signal, timeoutMs);
}

export function getJson(path: string, token?: string, signal?: AbortSignal) {
  return requestJson(path, { method: 'GET', token }, signal);
}

async function requestJson(
  path: string,
  request:
    | { method: 'POST'; body: unknown; token?: string }
    | { method: 'GET'; token?: string },
  signal?: AbortSignal,
  timeoutMs = 15000,
): Promise<unknown> {
  const controller = new AbortController();
  let timedOut = false;
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
      method: request.method,
      headers: {
        Accept: 'application/json',
        ...(request.method === 'POST'
          ? { 'Content-Type': 'application/json' }
          : {}),
        ...(request.token && { Authorization: `Bearer ${request.token}` }),
      },
      body:
        request.method === 'POST' ? JSON.stringify(request.body) : undefined,
      credentials: 'omit',
      signal: controller.signal,
    });
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      if (controller.signal.aborted)
        throw new DOMException('Aborted', 'AbortError');
      throw new ApiError(
        response.ok ? 'INVALID_RESPONSE' : 'HTTP_ERROR',
        response.status,
      );
    }
    if (!response.ok) {
      const code =
        isRecord(data) && typeof data.code === 'string'
          ? data.code
          : 'HTTP_ERROR';
      const message =
        isRecord(data) && typeof data.message === 'string' ? data.message : code;
      throw new ApiError(code, response.status, message);
    }
    return data;
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    if (timedOut) throw new ApiError('TIMEOUT');
    if (error instanceof ApiError) throw error;
    throw new ApiError('NETWORK_ERROR');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
