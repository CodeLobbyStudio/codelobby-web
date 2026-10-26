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
- `src/app/App.tsx` — podstawowe trasy, nawigacja i widoki informacyjne.
- `src/app/styles.css` — minimalne style szkieletu; pełny layout i wspólne komponenty powstaną w web #4.
- `src/shared/api/config.ts` — publiczny base URL API z konfiguracji Vite; klient HTTP powstanie w web #17.
- `tests/routing.test.tsx` — testy nawigacji, bezpośredniego wejścia na trasy i powrotu z 404.
- `tests/setup.ts` — środowisko Testing Library i sprzątanie DOM po testach.
- `vite.config.ts` — React, proxy developerskie `/api` i Vitest.
- `tsconfig*.json` — ścisłe typowanie aplikacji, testów i konfiguracji narzędzi.

Katalogi funkcjonalne pozostają na swoich miejscach. Kod domenowy dokładamy do odpowiedniej funkcji, gdy realizujemy jej ticket. Nie dodajemy atrap API ani danych użytkownika w szkielecie.
