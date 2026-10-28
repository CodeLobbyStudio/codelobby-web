import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const titles: Record<string, string> = {
  '/': 'Wspólne sesje programowania',
  '/login': 'Logowanie',
  '/register': 'Rejestracja',
  '/profile': 'Profil',
};

export function RouteEffects() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    document.title = `${titles[pathname] ?? 'Nie znaleziono strony'} — CodeLobby`;
    if (previousPath.current !== pathname) {
      document.getElementById('main')?.focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    previousPath.current = pathname;
  }, [pathname]);
  return null;
}
