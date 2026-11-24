import { useEffect, useRef, useState } from 'react';
import { ApiError } from '../../shared/api/http';
import { lobbyError } from './lobbyApi';

export function useLobbyAction() {
  const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => request.current?.abort(), []);

  async function submit<T>(action: (signal: AbortSignal) => Promise<T>) {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setError('');
    try {
      const result = await action(controller.signal);
      if (!controller.signal.aborted) return result;
    } catch (failure) {
      if (!controller.signal.aborted) setError(lobbyError(failure));
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setPending(false);
      }
    }
  }

  return { pending, error, submit };
}

export function useLobbyResource<T>(
  read: (signal: AbortSignal) => Promise<T>,
  pollMs?: number,
) {
  const [data, setData] = useState<T>();
  const [failure, setFailure] = useState<{ message: string; code?: string }>();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function load() {
      try {
        const value = await read(controller.signal);
        if (controller.signal.aborted) return;
        setData(value);
        setFailure(undefined);
      } catch (error) {
        if (controller.signal.aborted) return;
        const code = error instanceof ApiError ? error.code : undefined;
        setFailure({ message: lobbyError(error), code });
        if (
          error instanceof ApiError &&
          ([401, 403, 404].includes(error.status) ||
            code === 'TASK_ALREADY_SUBMITTED')
        ) {
          setData(undefined);
          return;
        }
      }
      if (pollMs !== undefined) timer = setTimeout(() => void load(), pollMs);
    }

    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [pollMs, read, revision]);

  return {
    data,
    error: failure?.message ?? '',
    errorCode: failure?.code,
    refresh: () => setRevision((value) => value + 1),
  };
}
