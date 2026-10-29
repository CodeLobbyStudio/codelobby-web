# Issue #4 — zakres i plan implementacji

Plan oparty na aktualnym opisie web #4 oraz granicach web #16 i #17.
Plan został przyjęty do realizacji. Layouty, wspólne komponenty, granica błędów,
tytuły/focus tras oraz testy są wdrożone na branchu `feat/4-layout-components`.
Finalny podział plików opisuje `STRUKTURA.md`.

## Wynik pierwotnej weryfikacji lokalnej (przed zmianą kierunku wizualnego)

- Czysta instalacja `npm ci`, build, lint, formatowanie i 25 testów przeszły na Node 24.22.1.
- W przeglądarce sprawdzono landing, logowanie, rejestrację, profil, odświeżenie
  profilu i powrót z 404; szerokości 320 px, 640 px i desktop.
- Przy 320 px i 640 px szerokość dokumentu nie przekracza szerokości dostępnego
  obszaru. Sprawdzono Tab, skip link i przeniesienie focusu do main po nawigacji.
- Główne pary kolorów tekstu i tła mają kontrast co najmniej 4.82:1; tekst
  pomocniczy na tle strony 5.31:1, tekst przycisku głównego 7.06:1.
- Test nawigacji potwierdza brak wywołań fetch. Kod nie dodaje klienta HTTP.
- Natywnego zoomu przeglądarki 200% nie udało się potwierdzić w podglądzie;
  sprawdzono osobno wąski reflow. Odświeżanie na docelowym hostingu produkcyjnym
  pozostaje kontrolą wdrożenia.
- Wynik GitHub Actions wymaga publikacji brancha i uruchomienia workflow.

Po przekazaniu referencji zespołu jasny kierunek został zastąpiony ciemnym.
Szczegóły nowego wyglądu i zasada publikacji dopiero po zatwierdzeniu znajdują się
w `TEAM-DESIGN.md`. Powyższe wartości kontrastu dotyczą poprzedniej palety.

## Punkt wyjścia i poprawki po review #20

- PR #20 jest zmergowany do `main`; szkielet używa React, TypeScript strict,
  Vite i React Router. Zachowujemy stos oraz strukturę funkcjonalną.
- Dodane w ramach przygotowania: Frontend CI (czysta instalacja, build, lint,
  formatowanie, testy) oraz testy domyślnego i skonfigurowanego adresu API.
- Rozdzielenie widoków z `App.tsx` jest uzasadnione przy wdrażaniu #4;
  nie wymaga osobnego przebudowywania całej architektury.
- Ochrona `/profile` i prawdziwa sesja należą do #17. Nie symulujemy logowania.
- Odświeżanie podstron w produkcji sprawdzamy po wyborze hostingu. Instrukcja
  SPA fallback w README już istnieje; sam Vite nie konfiguruje serwera produkcyjnego.

## Cel i granice

Spójny, spokojny interfejs na telefonie i komputerze: nagłówek, nazwa CodeLobby,
nawigacja, czytelna sekcja treści i wspólne komponenty. Bez dodatkowej biblioteki
UI, jeżeli wystarczą React i CSS. #4 nie narzuca makiety, fontu ani palety kolorów;
minimalizm i dostępność są wymaganiami, a szczegóły wizualne są decyzją projektową.

Host i Participant to role w konkretnym lobby, nie typy konta. Nie dodajemy wyboru
roli konta ani panelu administratora. Nie dodajemy żądań API, fikcyjnych danych
użytkownika, formularzy logowania, tokenów lub endpointów domenowych.

## Docelowy podział kodu

- `src/app/App.tsx`: deklaracje tras i składanie layoutów, bez treści wszystkich stron.
- `src/app/layouts/`: wspólny shell oraz layout publiczny i layout części konta.
  Wspólne elementy nagłówka i nawigacji są współdzielone, nie kopiowane.
- `src/app/pages/`: strona główna, widoki informacyjne i 404; kod funkcjonalny
  trafia później do `src/features/auth` i `src/features/profile` w odpowiednich ticketach.
- `src/shared/components/`: Button, FormField/Input, Alert, LoadingIndicator,
  EmptyState, ErrorState; małe komponenty z typowanymi propsami i wspólnym CSS.
- `src/app/`: granica błędów renderowania i style bazowe (kolory, odstępy,
  typografia). Komponenty współdzielone nie zależą od modułów funkcjonalnych.
- `src/shared/api/`: zachowanie istniejącej konfiguracji, bez nowego klienta HTTP.
- `tests/`: testy tras, layoutów, zachowań komponentów i obsługi błędów.

Publiczny layout obejmie `/`, `/login`, `/register`. Layout części konta będzie
przygotowany pod `/profile` i przyszłe zadania/lobby. Do czasu #17 `/profile`
pozostaje jawnym placeholderem, bez informacji sugerujących aktywną sesję.
Nie tworzymy działających `/tasks` i `/lobbies` ani aktywnych linków prowadzących
do nieistniejących ekranów. Przyszłe pozycje można pominąć do ich implementacji.

## Wymagania komponentów i dostępności

| Element          | Oczekiwane zachowanie                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Button           | Natywny przycisk, domyślnie `type="button"`, obsługa disabled/loading; nawigacja pozostaje linkiem                                    |
| FormField/Input  | Widoczna etykieta powiązana z polem, unikalne ID, opis i błąd przez `aria-describedby`, `aria-invalid`; przekazanie natywnych propsów |
| Alert            | Czytelny komunikat, wariant informacyjny/błędu, semantyka stosowna do pilności; znaczenie nie opiera się tylko na kolorze             |
| LoadingIndicator | Dostępna nazwa i status, ograniczenie animacji przy `prefers-reduced-motion`                                                          |
| EmptyState       | Krótki opis braku danych i opcjonalna akcja przekazana przez rodzica                                                                  |
| ErrorState       | Bezpieczny komunikat i opcjonalna akcja ponowienia; bez stacktrace i szczegółów technicznych                                          |
| Error boundary   | Fallback błędu renderowania z możliwością odzyskania widoku; nie zastępuje obsługi błędów API w #16/#17                               |
| 404              | Czytelny komunikat i działający powrót na stronę główną                                                                               |

Stosujemy semantyczny nagłówek, `nav` i `main`, link pominięcia nawigacji,
widoczny focus, logiczną kolejność Tab i aktywną pozycję nawigacji. Weryfikujemy
kontrast tekstu (cel 4.5:1 dla zwykłego tekstu), brak poziomego przewijania przy
320 px, czytelność przy powiększeniu 200% i układ desktopowy. Zmiana trasy powinna
aktualizować tytuł strony i zapewniać sensowne zarządzanie focusem.

## Kolejność realizacji i odbiór

1. Ustalić style bazowe i rozdzielić strony od routingu, zachowując działające trasy.
2. Dodać wspólne komponenty i layouty, następnie użyć ich w istniejących ekranach.
   Komponenty formularzy przygotować do #16 bez atrap rejestracji/logowania.
3. Dodać fallback błędów renderowania oraz dopracować 404 i obsługę klawiatury.
4. Sprawdzić zachowania komponentów: etykiety/błędy pola, disabled/loading
   przycisku, dostępne statusy, akcje EmptyState/ErrorState i fallback renderowania.
5. Uruchomić `npm ci`, `npm run build`, `npm run lint`, `npm run format:check`
   i `npm test`. W przeglądarce sprawdzić mobile/desktop, Tab, focus, powiększenie,
   wszystkie istniejące trasy, powrót z 404 i brak żądań do nieistniejącego API.
6. Uzupełnić dokumentację o finalny podział kodu i otworzyć PR do `main` przez
   GitHub CLI z `Closes #4`, opisem walidacji i obrazami UI. Przed mergem review.

W chwili analizy issue #4 nie miało przypisanego elementu projektu w odpowiedzi
GitHuba. Realizację uzgodnionego planu użytkownik zlecił wprost; nie zmieniano
samodzielnie statusu na tablicy CodeLobby Development.
