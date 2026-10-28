# Struktura frontendu

Na start dzielimy frontend głównie po funkcjach, a nie po typie pliku.

- `app/` — start aplikacji, routing i rzeczy globalne
- `features/lobby/` — tworzenie lobby, dołączanie i widok lobby
- `features/tasks/` — lista i widok zadań
- `features/submissions/` — wysyłanie rozwiązań i wyniki
- `shared/components/` — małe komponenty używane w wielu miejscach
- `shared/api/` — komunikacja z backendem
- `shared/types/` — wspólne typy
- `public/` — statyczne pliki
- `tests/` — testy, które nie siedzą obok konkretnego komponentu

## Szkielet React + TypeScript + Vite (web #3)

- `src/app/main.tsx` — start Reacta, BrowserRouter i globalny CSS.
- `src/app/App.tsx` — deklaracje tras i składanie layoutów; treść ekranów znajduje się w osobnych plikach.
- `src/app/layouts/` — SiteShell (nagłówek, main, stopka), PublicLayout i AccountLayout. Layout konta nie zastępuje autoryzacji z #17.
- `src/app/pages/` — landing, informacyjne ekrany logowania/rejestracji, profil i 404. Domena auth/profilu zostanie dodana w kolejnych ticketach do modułów funkcjonalnych.
- `src/app/RouteEffects.tsx` — tytuł strony, focus i przewijanie po zmianie ścieżki.
- `src/app/ErrorBoundary.tsx` — bezpieczny fallback błędów renderowania. Zmiana ścieżki resetuje błąd; nawigacja pozostaje poza granicą błędu.
- `src/app/styles.css` — zmienne kolorów i style layoutów oraz komponentów, breakpointy mobile/desktop i reduced motion.
- `src/shared/components/` — Button, FormField, Alert, LoadingIndicator, EmptyState, ErrorState. Komponenty przyjmują propsy i akcje, bez zależności od API i modułów domenowych.
- `src/shared/api/config.ts` — publiczny base URL API z konfiguracji Vite; klient HTTP powstanie w web #17.
- `tests/routing.test.tsx` — testy nawigacji, bezpośredniego wejścia na trasy i powrotu z 404.
- `tests/components.test.tsx` — zachowania przycisków/pól, dostępne komunikaty i stany oraz odzyskiwanie widoku po błędzie renderowania.
- `tests/api-config.test.ts` — adres API z konfiguracji i domyślne `/api`.
- `tests/setup.ts` — środowisko Testing Library i sprzątanie DOM po testach.
- `vite.config.ts` — React, proxy developerskie `/api` i Vitest.
- `tsconfig*.json` — ścisłe typowanie aplikacji, testów i konfiguracji narzędzi.
- `.github/workflows/ci.yml` — instalacja, build, lint, formatowanie i testy dla PR do main i push do main.

Katalogi funkcjonalne pozostają na swoich miejscach. Kod domenowy dokładamy do odpowiedniej funkcji, gdy realizujemy jej ticket. Nie dodajemy atrap API ani danych użytkownika w szkielecie.
