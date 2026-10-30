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
- `src/app/pages/` — landing, placeholder profilu i 404. Formularze konta należą do `src/features/auth/`.
- `src/features/auth/AuthPage.tsx` — formularze, walidacja i stany żądania; wspólne komponenty pól, przycisków i komunikatów.
- `src/features/auth/api/authApi.ts` — typowane register/login z walidacją odpowiedzi, bez danych demonstracyjnych.
- `src/features/auth/session.ts` — minimalny punkt przekazania tokenu wyłącznie w pamięci (#16); pełna sesja, `/me` i ochrona tras należą do #17.
- `src/features/auth/validation.ts` — walidacja emaila i hasła zgodna z ograniczeniami backendu, w tym limit bajtów UTF-8.
- `src/app/components/` — ilustracja edytora (EditorIllustration) i sekcje landingu, przygotowane według referencji zespołu. Nie są działającym lobby ani edytorem.
- `src/shared/components/NeonCode.tsx` — wspólny neon SVG dla landingu i formularzy konta: animacja kolorów, zsynchronizowane odbicie i ruch za kursorem.
- `src/app/RouteEffects.tsx` — tytuł strony, focus i przewijanie po zmianie ścieżki.
- `src/app/ErrorBoundary.tsx` — bezpieczny fallback błędów renderowania. Zmiana ścieżki resetuje błąd; nawigacja pozostaje poza granicą błędu.
- `src/app/styles.css` — zmienne kolorów i style layoutów oraz komponentów, breakpointy mobile/desktop i reduced motion.
- `src/shared/components/` — Button, FormField, Alert, LoadingIndicator, EmptyState, ErrorState. Komponenty przyjmują propsy i akcje, bez zależności od API i modułów domenowych.
- `src/shared/components/Icon.tsx` — współdzielone ikony SVG używane przez nawigację, stopkę i landing.
- `src/shared/api/config.ts` — publiczny base URL API z konfiguracji Vite.
- `src/shared/api/http.ts` — publiczny transport POST JSON, bez Bearer/cookies, z timeoutem, anulowaniem i bezpiecznymi błędami. #17 rozszerzy go o uwierzytelnione żądania.
- `tests/auth.test.tsx` i `tests/http.test.ts` — formularze, prawdziwe granice wywołań fetch z mockami w testach, sukces/błędy, walidacja, anulowanie, timeout i ręczne retry.
- `tests/routing.test.tsx` — testy nawigacji, bezpośredniego wejścia na trasy i powrotu z 404.
- `tests/components.test.tsx` — zachowania przycisków/pól, dostępne komunikaty i stany oraz odzyskiwanie widoku po błędzie renderowania.
- `tests/api-config.test.ts` — adres API z konfiguracji i domyślne `/api`.
- `tests/setup.ts` — środowisko Testing Library i sprzątanie DOM po testach.
- `vite.config.ts` — React, proxy developerskie `/api` i Vitest.
- `tsconfig*.json` — ścisłe typowanie aplikacji, testów i konfiguracji narzędzi.
- `.github/workflows/ci.yml` — instalacja, build, lint, formatowanie i testy dla PR do main i push do main.

Katalogi funkcjonalne pozostają na swoich miejscach. Kod domenowy dokładamy do odpowiedniej funkcji, gdy realizujemy jej ticket. Nie dodajemy atrap API ani danych użytkownika w szkielecie.

Aktualne założenia wizualne i szczegóły ze screenów zespołu opisuje `TEAM-DESIGN.md`.
Miniatura edytora jest opisana jako obraz. Powiększony dialog udostępnia treść
czytnikom ekranu oraz zakładki Opis, Przykłady i Testy z komponentu ProblemPreview.
Uruchom, Wyślij, Konsola i nawigacja zadań pozostają nieaktywne. Nie ma wykonywania
kodu ani żądań do backendu.
