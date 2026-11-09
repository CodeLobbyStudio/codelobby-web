import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';
import { Icon } from '../../shared/components/Icon';
import { session } from '../../features/auth/session';

export function SiteShell() {
  const accessToken = useSyncExternalStore(
    session.subscribe,
    session.getAccessToken,
    () => null,
  );
  const { pathname, state, key } = useLocation();
  const [initialKey] = useState(key);
  const isSectionNavigation = key !== initialKey;
  const [sectionVisibility, setSectionVisibility] = useState<{
    id: string;
    visible: boolean;
  } | null>(null);
  const selectedSection = isSectionNavigation ? state?.section : undefined;
  useEffect(() => {
    const section =
      pathname === '/' && typeof selectedSection === 'string'
        ? document.getElementById(selectedSection)
        : null;
    if (!section || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) =>
      setSectionVisibility({
        id: selectedSection,
        visible: entry.isIntersecting,
      }),
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [pathname, selectedSection]);
  const footerRef = useRef<HTMLElement>(null);
  const [notice, setNotice] = useState({ message: '', locationKey: key });
  const footerNotice = notice.locationKey === key ? notice.message : '';
  function setFooterNotice(message: string) {
    setNotice({ message, locationKey: key });
  }
  useEffect(() => {
    const footer = footerRef.current;
    if (!footer || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        setNotice((current) =>
          current.message ? { ...current, message: '' } : current,
        );
      }
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/" aria-label="CodeLobby — strona główna">
            <Icon name="code" className="brand-symbol" />
            <span>
              Code<span className="brand-accent">Lobby</span>
            </span>
          </Link>
          <nav id="main-navigation" aria-label="Nawigacja główna">
            {[
              { label: 'Zadania', icon: 'tasks', section: 'funkcje' },
              { label: 'Lobby', icon: 'lobby', section: 'jak-to-dziala' },
              { label: 'Ranking', icon: 'chart', section: 'jak-to-dziala' },
              {
                label: 'Dla prowadzących',
                icon: 'teacher',
                section: 'dla-prowadzacych',
              },
            ].map(({ label, icon, section }) => (
              <Link
                key={label}
                to="/"
                replace={pathname === '/'}
                state={{ section, navigationItem: label }}
                aria-current={
                  pathname === '/' &&
                  isSectionNavigation &&
                  state?.navigationItem === label &&
                  (sectionVisibility?.id !== section ||
                    sectionVisibility.visible)
                    ? 'location'
                    : undefined
                }
              >
                <Icon name={icon} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            {accessToken && (
              <button
                type="button"
                className="notification-button"
                disabled
                aria-label="Powiadomienia — w przygotowaniu"
                title="Powiadomienia — w przygotowaniu"
              >
                <Icon name="bell" />
              </button>
            )}
            <NavLink className="login-link" to="/login">
              Zaloguj się
            </NavLink>
            <NavLink
              className="button button--primary signup-link"
              to="/register"
            >
              Załóż konto
            </NavLink>
          </div>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="site-footer" ref={footerRef}>
        <div className="footer-inner">
          <div className="footer-identity">
            <Link
              className="brand"
              to="/"
              aria-label="CodeLobby — strona główna"
            >
              <Icon name="code" />
              <span>
                Code<span className="brand-accent">Lobby</span>
              </span>
            </Link>
            <p>© 2026 CodeLobby</p>
          </div>
          <nav aria-label="Informacje">
            <button
              type="button"
              onClick={() =>
                setFooterNotice(
                  'Polityka prywatności — dokument będzie dostępny przed uruchomieniem platformy.',
                )
              }
            >
              Polityka prywatności
            </button>
            <button
              type="button"
              onClick={() =>
                setFooterNotice(
                  'Regulamin — dokument będzie dostępny przed uruchomieniem platformy.',
                )
              }
            >
              Regulamin
            </button>
            <button
              type="button"
              onClick={() =>
                setFooterNotice(
                  'Kontakt — dane kontaktowe pojawią się w kolejnym etapie.',
                )
              }
            >
              Kontakt
            </button>
            <button
              type="button"
              onClick={() =>
                setFooterNotice(
                  'FAQ — odpowiedzi na najczęstsze pytania pojawią się w kolejnym etapie.',
                )
              }
            >
              FAQ
            </button>
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
                aria-label={`${name} — link w przygotowaniu`}
                title={`${name} — link w przygotowaniu`}
                onClick={() =>
                  setFooterNotice(
                    `${name} — oficjalny link zostanie dodany po jego udostępnieniu.`,
                  )
                }
              >
                <Icon name={icon} />
              </button>
            ))}
          </div>
        </div>
        {footerNotice && (
          <p className="footer-notice content-width" role="status">
            {footerNotice}
          </p>
        )}
      </footer>
    </div>
  );
}
