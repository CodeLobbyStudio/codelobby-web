import { Link } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';

export function AuthPlaceholderPage({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login';
  return (
    <section className="auth-layout content-width">
      <div className="auth-panel">
        <p className="eyebrow">W przygotowaniu</p>
        <h1>{isLogin ? 'Logowanie' : 'Rejestracja'}</h1>
        <p>
          {isLogin
            ? 'Tu rozpocznie się Twoja kolejna sesja.'
            : 'Jedno konto. Wiele wspólnych sesji.'}
        </p>
        <Alert title="Jeszcze chwila">
          <p>
            {isLogin ? 'Formularz logowania' : 'Formularz zakładania konta'}{' '}
            pojawi się w kolejnym etapie. Na razie nie przyjmujemy danych.
          </p>
        </Alert>
        <p className="auth-switch">
          {isLogin ? 'Nie masz jeszcze konta?' : 'Masz już konto?'}{' '}
          <Link to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Przejdź do rejestracji' : 'Przejdź do logowania'}
          </Link>
        </p>
        <Link className="text-link auth-home-link" to="/">
          ← Wróć na stronę główną
        </Link>
      </div>
    </section>
  );
}
