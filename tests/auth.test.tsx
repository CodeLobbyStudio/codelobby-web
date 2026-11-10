import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/app/App';
import { session } from '../src/features/auth/session';
import { validateCredentials } from '../src/features/auth/validation';

afterEach(() => {
  vi.unstubAllGlobals();
  session.logout();
});
function setup(path = '/login') {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  const view = render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
  return { fetch, ...view };
}
function fill(password = 'Password123!', email = ' Test@Example.com ') {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText('Hasło'), {
    target: { value: password },
  });
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });
const profile = {
  id: 17,
  email: 'profile@example.com',
  createdAt: '2026-10-30T00:00:00Z',
};

describe('auth forms', () => {
  describe.each(['example@localhost', '"much.more unusual"@example.com'])(
    'email address %s',
    (email) => {
      it.each([
        ['/login', 'Zaloguj się', '/api/auth/login'],
        ['/register', 'Załóż konto', '/api/auth/register'],
      ])('submits the address on %s', async (path, button, endpoint) => {
        const { fetch } = setup(path);
        fetch.mockResolvedValue(json({ code: 'VALIDATION_ERROR' }, 400));
        fill('Password123!', email);

        await userEvent.click(screen.getByRole('button', { name: button }));

        expect(fetch).toHaveBeenCalledExactlyOnceWith(
          endpoint,
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({
              email,
              password: 'Password123!',
            }),
          }),
        );
      });
    },
  );
  it('validates before sending and focuses the invalid field', async () => {
    const { fetch } = setup('/register');
    await userEvent.click(screen.getByRole('button', { name: 'Załóż konto' }));
    expect(screen.getByLabelText('Email')).toHaveFocus();
    expect(screen.getByText('Podaj prawidłowy adres email.')).toBeVisible();
    expect(fetch).not.toHaveBeenCalled();
  });
  it('enforces UTF-8 password limits without imposing registration rules on login', () => {
    expect(
      validateCredentials('x@y.pl', 'ą'.repeat(37), true).password,
    ).toMatch(/72 bajty/);
    expect(validateCredentials('x@y.pl', 'a'.repeat(72), true)).toEqual({});
    expect(validateCredentials('x@y.pl', 'short', true).password).toBeTruthy();
    expect(validateCredentials('x@y.pl', 'short', false)).toEqual({});
  });
  it('registers through the real API boundary and returns to login without the password', async () => {
    const { fetch } = setup('/register');
    fetch.mockResolvedValue(
      json(
        { id: 1, email: 'test@example.com', createdAt: '2026-10-30T00:00:00Z' },
        201,
      ),
    );
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'Załóż konto' }));
    expect(await screen.findByText('Konto zostało utworzone')).toBeVisible();
    expect(screen.getByLabelText('Hasło')).toHaveValue('');
    expect(session.getAccessToken()).toBeNull();
    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/auth/register');
    expect(JSON.parse(options.body)).toEqual({
      email: 'Test@Example.com',
      password: 'Password123!',
    });
    expect(options.headers).not.toHaveProperty('Authorization');
    expect(options.headers['Content-Type']).toBe('application/json');
  });
  it('verifies login with a Bearer token, renders the backend profile and logs out', async () => {
    const { fetch } = setup();
    fetch
      .mockResolvedValueOnce(
        json({ accessToken: 'test-token', tokenType: 'Bearer' }),
      )
      .mockResolvedValueOnce(json(profile));
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(
      await screen.findByRole('heading', { name: 'Profil' }),
    ).toBeVisible();
    expect(screen.getByText(profile.email)).toBeVisible();
    expect(screen.getByText(String(profile.id))).toBeVisible();
    expect(screen.getByText(/października/)).toHaveAttribute(
      'datetime',
      profile.createdAt,
    );
    expect(fetch.mock.calls[0][1].headers).not.toHaveProperty('Authorization');
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      '/api/users/me',
      expect.objectContaining({
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer test-token',
        },
      }),
    );
    expect(session.getAccessToken()).toBe('test-token');
    expect(
      screen.getByRole('button', { name: 'Powiadomienia — w przygotowaniu' }),
    ).toBeDisabled();
    expect(screen.queryByLabelText('Hasło')).not.toBeInTheDocument();
    expect(sessionStorage.getItem('codelobby.accessToken')).toBe('test-token');
    expect(sessionStorage.length).toBe(1);
    expect(localStorage.length).toBe(0);
    await userEvent.click(screen.getByRole('button', { name: 'Wyloguj się' }));
    expect(
      screen.getByRole('heading', { level: 1, name: /Koduj/ }),
    ).toBeVisible();
    expect(screen.queryByText(profile.email)).not.toBeInTheDocument();
    expect(session.getAccessToken()).toBeNull();
    expect(session.getCurrentUser()).toBeNull();
    expect(sessionStorage.getItem('codelobby.accessToken')).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it.each([
    [
      () => json({ code: 'INVALID_TOKEN' }, 401),
      /Nie udało się potwierdzić sesji/,
    ],
    [
      () => {
        throw new TypeError('network');
      },
      /Nie można połączyć/,
    ],
  ])(
    'leaves the session anonymous when profile verification fails',
    async (reply, message) => {
      const { fetch } = setup();
      fetch
        .mockResolvedValueOnce(
          json({ accessToken: 'test-token', tokenType: 'Bearer' }),
        )
        .mockImplementationOnce(reply);
      fill();
      await userEvent.click(
        screen.getByRole('button', { name: 'Zaloguj się' }),
      );
      expect(await screen.findByText(message)).toBeVisible();
      expect(session.getSnapshot()).toEqual({ status: 'anonymous' });
      expect(session.getAccessToken()).toBeNull();
      expect(
        screen.queryByRole('link', { name: 'Profil' }),
      ).not.toBeInTheDocument();
      expect(fetch).toHaveBeenCalledTimes(2);
    },
  );
  it.each([
    [401, 'INVALID_CREDENTIALS', 'Nieprawidłowy email lub hasło.'],
    [409, 'EMAIL_ALREADY_EXISTS', /Ten adres email jest już zajęty/],
    [400, 'VALIDATION_ERROR', /Sprawdź email i hasło/],
    [500, 'INTERNAL_SERVER_ERROR', /Serwer jest chwilowo niedostępny/],
  ])(
    'handles %s without exposing server details',
    async (status, code, message) => {
      const { fetch } = setup();
      fetch.mockResolvedValue(
        json(
          { code, message: 'PRIVATE SERVER DETAILS', timestamp: 'now' },
          status,
        ),
      );
      fill();
      await userEvent.click(
        screen.getByRole('button', { name: 'Zaloguj się' }),
      );
      expect(await screen.findByText(message)).toBeVisible();
      expect(
        screen.queryByText('PRIVATE SERVER DETAILS'),
      ).not.toBeInTheDocument();
      expect(session.getAccessToken()).toBeNull();
    },
  );
  it('blocks duplicate requests and allows a manual retry after a network failure', async () => {
    const { fetch } = setup();
    let reject!: (error: Error) => void;
    fetch.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    fill();
    const button = screen.getByRole('button', { name: 'Zaloguj się' });
    fireEvent.submit(button.closest('form')!);
    fireEvent.submit(button.closest('form')!);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(button).toBeDisabled();
    await act(async () => reject(new TypeError('network')));
    expect(await screen.findByText(/Nie można połączyć/)).toBeVisible();
    fetch
      .mockResolvedValueOnce(
        json({ accessToken: 'retry-token', tokenType: 'Bearer' }),
      )
      .mockResolvedValueOnce(json(profile));
    await userEvent.click(button);
    expect(
      await screen.findByRole('heading', { name: 'Profil' }),
    ).toBeVisible();
  });
  it('rejects malformed success responses', async () => {
    const { fetch } = setup();
    fetch.mockResolvedValue(json({ password: 'bad' }));
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(await screen.findByText(/nieprawidłową odpowiedź/)).toBeVisible();
    expect(session.getAccessToken()).toBeNull();
  });
  it('restores a saved session only after verifying it with the backend', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(json(profile));
    vi.stubGlobal('fetch', fetch);
    await session.login('test-token');

    vi.resetModules();
    const { session: reloaded } = await import('../src/features/auth/session');
    expect(reloaded.getSnapshot()).toEqual({ status: 'initializing' });
    expect(reloaded.getAccessToken()).toBeNull();
    expect(reloaded.getCurrentUser()).toBeNull();

    fetch.mockResolvedValueOnce(json(profile));
    await Promise.all([reloaded.restore(), reloaded.restore()]);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/users/me',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(reloaded.getCurrentUser()).toEqual(profile);
  });
  it('keeps a saved token after a network error and removes it if retry returns 401', async () => {
    sessionStorage.setItem('codelobby.accessToken', 'old-token');
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(json({ code: 'INVALID_TOKEN' }, 401));
    vi.stubGlobal('fetch', fetch);

    vi.resetModules();
    const { session: reloaded } = await import('../src/features/auth/session');
    await reloaded.restore();
    expect(reloaded.getSnapshot()).toEqual({ status: 'unavailable' });
    expect(reloaded.getCurrentUser()).toBeNull();
    expect(sessionStorage.getItem('codelobby.accessToken')).toBe('old-token');

    await reloaded.restore();
    expect(reloaded.getSnapshot()).toEqual({ status: 'anonymous' });
    expect(sessionStorage.getItem('codelobby.accessToken')).toBeNull();
  });
  it('does not restore a session when profile verification finishes after logout', async () => {
    let resolve!: (value: Response) => void;
    const fetch = vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal('fetch', fetch);
    const pending = session.login('test-token');
    expect(session.getSnapshot()).toEqual({ status: 'initializing' });

    session.logout();
    resolve(json(profile));
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(session.getCurrentUser()).toBeNull();
    expect(session.getAccessToken()).toBeNull();
    expect(sessionStorage.getItem('codelobby.accessToken')).toBeNull();
  });
  it('aborts on navigation and ignores a late successful response', async () => {
    const { fetch } = setup();
    let resolve!: (value: Response) => void;
    fetch.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    await userEvent.click(
      screen.getByRole('link', { name: 'Przejdź do rejestracji' }),
    );
    expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
    await act(async () =>
      resolve(json({ accessToken: 'late-token', tokenType: 'Bearer' })),
    );
    await waitFor(() => expect(session.getAccessToken()).toBeNull());
    expect(screen.getByRole('heading', { name: 'Rejestracja' })).toBeVisible();
  });
});
