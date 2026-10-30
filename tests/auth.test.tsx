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
function fill(password = 'Password123!') {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: ' Test@Example.com ' },
  });
  fireEvent.change(screen.getByLabelText('Hasło'), {
    target: { value: password },
  });
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });

describe('auth forms', () => {
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
  it('hands the token to the in-memory session and clears the password after login', async () => {
    const { fetch } = setup();
    fetch.mockResolvedValue(
      json({ accessToken: 'test-token', tokenType: 'Bearer' }),
    );
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(await screen.findByText('Logowanie powiodło się')).toBeVisible();
    expect(session.getAccessToken()).toBe('test-token');
    expect(
      screen.getByRole('button', { name: 'Powiadomienia — w przygotowaniu' }),
    ).toBeDisabled();
    expect(screen.queryByLabelText('Hasło')).not.toBeInTheDocument();
    expect(sessionStorage.length).toBe(0);
    expect(localStorage.length).toBe(0);
  });
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
    fetch.mockResolvedValue(
      json({ accessToken: 'retry-token', tokenType: 'Bearer' }),
    );
    await userEvent.click(button);
    expect(await screen.findByText('Logowanie powiodło się')).toBeVisible();
  });
  it('rejects malformed success responses', async () => {
    const { fetch } = setup();
    fetch.mockResolvedValue(json({ password: 'bad' }));
    fill();
    await userEvent.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    expect(await screen.findByText(/nieprawidłową odpowiedź/)).toBeVisible();
    expect(session.getAccessToken()).toBeNull();
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
