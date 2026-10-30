import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { Alert } from '../../shared/components/Alert';
import { FormField } from '../../shared/components/FormField';
import { NeonCode } from '../../shared/components/NeonCode';
import { ApiError } from '../../shared/api/http';
import { authApi } from './api/authApi';
import { session } from './session';
import { validateCredentials } from './validation';

function errorMessage(error: unknown, register: boolean) {
  if (!(error instanceof ApiError))
    return 'Nie udało się wykonać operacji. Spróbuj ponownie.';
  if (error.status >= 500)
    return 'Serwer jest chwilowo niedostępny. Spróbuj ponownie za chwilę.';
  if (error.code === 'INVALID_CREDENTIALS' || error.status === 401)
    return 'Nieprawidłowy email lub hasło.';
  if (error.code === 'EMAIL_ALREADY_EXISTS')
    return 'Ten adres email jest już zajęty. Zaloguj się lub użyj innego adresu.';
  if (error.code === 'INVALID_PASSWORD')
    return 'Hasło jest zbyt długie. Użyj maksymalnie 72 bajtów UTF-8.';
  if (
    error.code === 'VALIDATION_ERROR' ||
    error.code === 'INVALID_REQUEST_BODY'
  )
    return 'Sprawdź email i hasło. Serwer nie zaakceptował danych.';
  if (error.code === 'TIMEOUT')
    return register
      ? 'Serwer nie odpowiedział na czas. Konto mogło już zostać utworzone — możesz spróbować się zalogować lub ponowić rejestrację.'
      : 'Serwer nie odpowiedział na czas. Sprawdź połączenie i spróbuj ponownie.';
  if (error.code === 'NETWORK_ERROR')
    return 'Nie można połączyć się z serwerem. Sprawdź połączenie i spróbuj ponownie.';
  if (error.code === 'INVALID_RESPONSE')
    return 'Serwer zwrócił nieprawidłową odpowiedź. Spróbuj ponownie później.';
  return 'Nie udało się wykonać operacji. Spróbuj ponownie.';
}

export function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const register = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const result = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      request.current?.abort();
    },
    [],
  );
  useEffect(() => {
    if (success || error) result.current?.focus();
  }, [success, error]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const next = validateCredentials(email, password, register);
    setErrors(next);
    setError('');
    if (Object.keys(next).length) {
      form.current
        ?.querySelector<HTMLInputElement>(
          next.email ? '[name=email]' : '[name=password]',
        )
        ?.focus();
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    try {
      const credentials = { email: email.trim(), password };
      if (register) {
        await authApi.register(credentials, controller.signal);
        if (controller.signal.aborted) return;
        setPassword('');
        navigate('/login', { replace: true, state: { registered: true } });
      } else {
        const response = await authApi.login(credentials, controller.signal);
        if (controller.signal.aborted) return;
        session.login(response.accessToken);
        setPassword('');
        setSuccess(true);
      }
    } catch (failure) {
      if (!controller.signal.aborted) {
        setError(errorMessage(failure, register));
      }
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <section className="auth-layout auth-layout--with-art content-width">
      <div className="auth-panel">
        <p className="eyebrow">Twoje konto CodeLobby</p>
        <h1>{register ? 'Rejestracja' : 'Logowanie'}</h1>
        <p>
          {register
            ? 'Jedno konto. Wiele wspólnych sesji.'
            : 'Tu rozpocznie się Twoja kolejna sesja.'}
        </p>
        {!register && location.state?.registered && !success && (
          <Alert title="Konto zostało utworzone" announce>
            Możesz się teraz zalogować.
          </Alert>
        )}
        <div ref={result} tabIndex={-1} className="auth-result">
          {error && (
            <Alert title="Spróbuj ponownie" variant="error" announce>
              {error}
            </Alert>
          )}
          {success && (
            <Alert title="Logowanie powiodło się" announce>
              Profil i widoki konta są jeszcze w przygotowaniu. Odświeżenie
              strony zakończy tę tymczasową sesję.
            </Alert>
          )}
        </div>
        {!success && (
          <form
            ref={form}
            onSubmit={submit}
            noValidate
            className="auth-form"
            aria-busy={loading}
          >
            <FormField
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              required
              value={email}
              disabled={loading}
              error={errors.email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="auth-password">
              <FormField
                label="Hasło"
                name="password"
                type={visible ? 'text' : 'password'}
                autoComplete={register ? 'new-password' : 'current-password'}
                required
                value={password}
                disabled={loading}
                error={errors.password}
                hint={
                  register
                    ? 'Co najmniej 8 znaków, maksymalnie 72 bajty UTF-8.'
                    : undefined
                }
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="auth-password-toggle"
                aria-pressed={visible}
                disabled={loading}
                onClick={() => setVisible(!visible)}
              >
                {visible ? 'Ukryj hasło' : 'Pokaż hasło'}
              </button>
            </div>
            <Button
              type="submit"
              loading={loading}
              loadingLabel={register ? 'Tworzenie konta…' : 'Logowanie…'}
            >
              {register ? 'Załóż konto' : 'Zaloguj się'}
            </Button>
          </form>
        )}
        {!success && (
          <p className="auth-switch">
            {register ? 'Masz już konto?' : 'Nie masz jeszcze konta?'}{' '}
            <Link to={register ? '/login' : '/register'}>
              {register ? 'Przejdź do logowania' : 'Przejdź do rejestracji'}
            </Link>
          </p>
        )}
        <Link className="text-link auth-home-link" to="/">
          ← Wróć na stronę główną
        </Link>
      </div>
      <div className="auth-art" aria-hidden="true">
        <NeonCode />
      </div>
    </section>
  );
}
