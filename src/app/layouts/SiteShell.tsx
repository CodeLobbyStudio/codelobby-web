import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { Icon } from '../../shared/components/Icon';

function Brand() {
  return (
    <span className="brand">
      <Icon name="code" className="brand-symbol" />
      <span>
        Code<span className="brand-accent">Lobby</span>
      </span>
    </span>
  );
}

export function SiteShell() {
  return (
    <div className="site-shell static-preview">
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Brand />
          <nav id="main-navigation" aria-label="Nawigacja główna">
            {[
              ['Zadania', 'tasks'],
              ['Lobby', 'lobby'],
              ['Ranking', 'chart'],
              ['Dla prowadzących', 'teacher'],
            ].map(([label, icon]) => (
              <button key={label} type="button" disabled>
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="notification-button"
              disabled
              aria-label="Powiadomienia — w przygotowaniu"
            >
              <Icon name="bell" />
            </button>
            <button className="login-link" type="button" disabled>
              Zaloguj się
            </button>
            <button
              className="button button--primary signup-link"
              type="button"
              disabled
            >
              Załóż konto
            </button>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-identity">
            <Brand />
            <p>© 2026 CodeLobby</p>
          </div>
          <nav aria-label="Informacje">
            {['Polityka prywatności', 'Regulamin', 'Kontakt', 'FAQ'].map(
              (label) => (
                <button type="button" key={label} disabled>
                  {label}
                </button>
              ),
            )}
          </nav>
          <div className="social-links" aria-label="Kanały społecznościowe">
            {[
              ['github', 'GitHub'],
              ['discord', 'Discord'],
              ['youtube', 'YouTube'],
              ['x', 'X'],
            ].map(([icon, name]) => (
              <button
                type="button"
                key={icon}
                disabled
                aria-label={`${name} — w przygotowaniu`}
              >
                <Icon name={icon} />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
