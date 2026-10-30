import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollToSection } from './scrollToSection';

const titles: Record<string, string> = {
  '/': 'Wspólne sesje programowania',
  '/login': 'Logowanie',
  '/register': 'Rejestracja',
  '/profile': 'Profil',
};

export function RouteEffects() {
  const { pathname, state, key } = useLocation();
  const initialKey = useRef(key);
  const previousPath = useRef(pathname);
  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.getElementById('main')?.focus({ preventScroll: true });
    return () => {
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);
  useEffect(() => {
    let cancelScroll: (() => void) | undefined;
    document.title = `${titles[pathname] ?? 'Nie znaleziono strony'} — CodeLobby`;
    if (previousPath.current !== pathname) {
      document.getElementById('main')?.focus();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    if (
      pathname === '/' &&
      key !== initialKey.current &&
      ['funkcje', 'jak-to-dziala', 'dla-prowadzacych'].includes(state?.section)
    ) {
      const section = document.getElementById(state.section);
      section?.focus({ preventScroll: true });
      if (section) {
        const isJourney = state.section === 'jak-to-dziala';
        const target = isJourney
          ? (section.querySelector<HTMLElement>('.journey') ?? section)
          : section;
        cancelScroll = scrollToSection(
          target,
          isJourney || state.section === 'funkcje',
        );
      }
    }
    previousPath.current = pathname;
    return cancelScroll;
  }, [pathname, state, key]);
  return null;
}
