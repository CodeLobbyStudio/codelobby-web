import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';

export function SiteShell() {
  const { pathname } = useLocation();
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="CodeLobby — strona główna">
            <span className="brand-mark" aria-hidden="true">
              c<span>.</span>
            </span>
            CodeLobby
          </Link>
          <nav aria-label="Nawigacja główna">
            <NavLink to="/" end>
              Start
            </NavLink>
            <NavLink to="/profile">Profil</NavLink>
            <NavLink to="/login">Logowanie</NavLink>
            <NavLink className="nav-register" to="/register">
              Rejestracja
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-brand">CodeLobby</span>
          <span>Przestrzeń do wspólnego programowania.</span>
          <span className="footer-note">Projekt w rozwoju</span>
        </div>
      </footer>
    </div>
  );
}
