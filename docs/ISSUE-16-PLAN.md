# Issue #16 — rejestracja i logowanie

## Stan przygotowania — 2026-10-30

- PR #23 został zaakceptowany i zmergowany; web #4 jest zamknięte.
- Lokalny `main` pobrano przez `git pull --ff-only` do `873f59f`.
- Branch roboczy: `feat/16-auth-forms`, utworzony z aktualnego `main`.
- Kolejne zadanie: [web #16](https://github.com/CodeLobbyStudio/codelobby-web/issues/16),
  przypisane do DanR-ghub; następne: [web #17](https://github.com/CodeLobbyStudio/codelobby-web/issues/17).
- GitHub nie zwrócił elementów Project dla #16/#17, więc statusu Ready nie
  potwierdzono. Przed implementacją należy zweryfikować przypisanie i status
  w CodeLobby Development zgodnie ze wspólnym CONTRIBUTING.
- Użytkownik zatwierdził implementację #16, sprawdził rejestrację, logowanie,
  duplikat emaila i oba widoki, a następnie zatwierdził commit, push i PR.

## Źródła i zgodność

Przejrzano aktualny README organizacji i CONTRIBUTING z `.github/origin/main`,
README frontendu, `docs/STRUKTURA.md`, plan #4, notatki TEAM-DESIGN i UI-REVIEW,
aktualne opisy #16/#17 oraz kod backendu z odświeżonego `origin/main`:
AuthController, AuthService, DTO, SecurityConfig, ApiErrorResponse,
GlobalExceptionHandler, testy rejestracji/logowania i README backendu.

Zachowujemy React, TypeScript strict, Vite, React Router i istniejące komponenty.
Nie potrzebujemy nowej biblioteki formularzy ani klienta HTTP do dwóch żądań.
Interfejs po polsku, ciemny styl i pomarańczowe akcenty zgodne z #4.
Host/Participant to role w lobby; rejestracja nie wybiera roli użytkownika.

## Potwierdzony kontrakt

| Operacja                  | Request JSON        | Sukces                                    |
| ------------------------- | ------------------- | ----------------------------------------- |
| `POST /api/auth/register` | `{email, password}` | 201: `{id, email, createdAt}`             |
| `POST /api/auth/login`    | `{email, password}` | 200: `{accessToken, tokenType: "Bearer"}` |

- Rejestracja nie loguje automatycznie i nie zwraca JWT.
- Błędy mają `{code, message, timestamp}`. Obsługujemy 409 EMAIL_ALREADY_EXISTS,
  401 INVALID_CREDENTIALS, 400 VALIDATION_ERROR / INVALID_REQUEST_BODY /
  INVALID_PASSWORD oraz błędy 5xx, sieci, timeoutu i niepoprawnej odpowiedzi.
- Email jest trimowany przed walidacją i normalizowany przez serwer do małych
  liter. Rejestracja ogranicza email do 230 znaków.
- Hasło rejestracji: minimum 8, maksimum 72 znaki oraz maksimum 72 bajty UTF-8
  sprawdzane dodatkowo przez AuthService. UI uwzględnia limit bajtów, aby polskie
  znaki i emoji nie przechodziły pozornie poprawnej walidacji.
- Hasła nie trimujemy ani nie zmieniamy. Logowanie wymaga niepustego hasła;
  nie dokładamy mu arbitralnych reguł z formularza rejestracji.
- Backend nie wymaga konkretnej kombinacji cyfr, wielkich liter i symboli.
  Nie wymyślamy dodatkowej polityki haseł ani endpointów reset/refresh/logout.
- Endpointy auth są publiczne; nie wysyłamy do nich Authorization.

## Podział odpowiedzialności #16 / #17

#16 dostarcza prawdziwe formularze, typy, fasadę authApi i obsługę odpowiedzi.
#17 rozwija sesję, pobiera `/api/users/me`, chroni routing, obsługuje 401,
wylogowanie i ewentualne odtwarzanie sesji po odświeżeniu.

Dla #16 przygotowujemy minimalny punkt przekazania otrzymanego tokenu do
`features/auth/session` (np. `login(accessToken)`, stan wyłącznie w pamięci).
Nie traktujemy tego jako kompletnej sesji ani zweryfikowanego profilu.
Nie przechowujemy tokenu w URL, stanie routera, logach ani localStorage.
Persistencja i kompromisy sessionStorage należą do #17. Nie przechowujemy hasła
po sukcesie. Po loginie pokazujemy rzeczywiste potwierdzenie sukcesu, bez
fikcyjnych danych profilu i bez sugerowania gotowego aktywnego lobby.

Wspólny transport JSON może powstać teraz w minimalnym zakresie potrzebnym
authApi (fetch, Content-Type, walidacja odpowiedzi, timeout, anulowanie i błędy).
#17 rozszerzy ten sam moduł o Bearer i wspólne zachowanie po 401; nie tworzymy
dwóch równoległych klientów HTTP ani pełnej infrastruktury sesji w #16.

## Plan implementacji

1. Dodać `src/features/auth/api/` z DTO RegisterRequest/RegisterResponse,
   LoginRequest/LoginResponse i authApi; ApiErrorResponse w warstwie wspólnej.
   Użyć `src/shared/api/config.ts` i istniejącego proxy `/api`.
2. W `src/features/auth/` zbudować widoki logowania i rejestracji z użyciem
   FormField, Button, Alert i publicznego layoutu. Podmienić placeholdery w App.
3. Zapewnić email/hasło, poprawne autocomplete, jawne etykiety, błędy powiązane
   z polami, focus na błędzie, klawiaturę i komunikaty ogłaszane czytnikom.
   Bez pozornych zgód prawnych, wyboru ADMIN i nieistniejącego resetu hasła.
4. Walidować formularz, blokować równoległy submit, pokazywać loading i pozwalać
   na ręczną ponowną próbę. Nie ponawiać POST automatycznie po timeoutach.
   Anulować żądania po opuszczeniu widoku; ignorować spóźnione odpowiedzi.
5. Po rejestracji wyczyścić hasło i przejść do logowania z potwierdzeniem.
   Po loginie przekazać token do minimalnego modułu sesji i wyczyścić hasło.
   Nie logować danych formularza, tokenów ani surowych odpowiedzi backendu.
6. Mapować błędy na bezpieczne komunikaty po polsku. Przy 401 użyć wspólnego
   „Nieprawidłowy email lub hasło”, bez ujawniania istnienia konta. Przy 409
   pokazać informację o zajętym emailu; 5xx bez stacktrace i szczegółów serwera.
7. Zaktualizować README i opis struktury: działające formularze, uruchomienie
   backendu/bazy, konfiguracja proxy i precyzyjne ograniczenia przed #17.

## Weryfikacja i odbiór

- Testy API: adres z konfiguracji, JSON/Content-Type, 201/200, DTO, brak Bearer
  w publicznych żądaniach, 400/401/409/500, timeout/network i błędne odpowiedzi.
- Testy formularzy: walidacja, Unicode i limit bajtów hasła, sukces, komunikaty
  błędów, loading, blokada podwójnego submitu, retry, usuwanie hasła po sukcesie
  i przekazanie tokenu bez zapisywania hasła.
- Regresje: istniejące trasy, landing i modal; login/register nadal korzystają
  ze wspólnego shella i poprawnego focusu/tytułu strony.
- Ręcznie: rejestracja → logowanie na rzeczywistym backendzie z lokalnym
  kontem testowym, duplikat, złe hasło, niedostępny backend, klawiatura i 320 px.
- Backend wymaga Java 21, PostgreSQL przez Docker Compose z infra oraz lokalnych
  DB_PASSWORD i JWT_SECRET_BASE64 zgodnie z README backendu. Sekrety pozostają
  poza VITE_* i repo. Nie zastępujemy niedostępnego backendu atrapą sukcesu.
- Przed odbiorem: `npm run build`, `npm run lint`, `npm run format:check`, `npm test`.
- Najpierw odbiór lokalny przez użytkownika. Commit/push/PR dopiero na jego
  wyraźne polecenie; PR po angielsku, z opisem i zrzutami, powiązany z #16.

## Kolejność dalszych prac

1. #16 — formularze i prawdziwe register/login.
2. #17 — spójny klient API, sesja JWT, `/me`, ochrona profilu i logout.
3. Dopiero potem katalog/tworzenie zadań i lobby zgodnie z dostępnością API.
   Zamknięte zadania z backlogu nie są automatycznie uznawane za wdrożone.

## Wynik implementacji lokalnej

- Dodano formularze, DTO i authApi, publiczny transport JSON, timeout/anulowanie,
  walidację UTF-8, komunikaty błędów, loading oraz minimalny magazyn tokenu
  wyłącznie w pamięci. Usunięto zastąpiony AuthPlaceholderPage.
- Rejestracja prowadzi do logowania z potwierdzeniem. Login przekazuje token
  do session.login i pokazuje potwierdzenie, bez fikcyjnego profilu.
- Dodano 13 przypadków testowych; łącznie 51 testów w 7 plikach przechodzi.
  Build, lint i formatowanie przeszły. `.gitattributes` utrzymuje LF dla tekstu,
  aby Windows z core.autocrlf nie powodował błędów Prettiera po checkout.
- W przeglądarce sprawdzono walidację, focus, pokazywanie/ukrywanie hasła,
  przejście między formularzami, błąd niedostępnego backendu i szerokość 320 px.
- Po późniejszym zatwierdzeniu konfiguracji lokalnej zainstalowano Microsoft
  OpenJDK 21, uruchomiono PostgreSQL 17 przez istniejący Compose i backend
  na 127.0.0.1:8080. Sekrety są w ignorowanym infra/.env; nie zmieniono kodu backendu.
- Rzeczywiste register → login przez formularze zakończyło się sukcesem.
  Sprawdzono też UI dla zajętego emaila i błędnego hasła oraz obecność rekordu
  w app_users. Siedem testów endpointów przez proxy oraz 28 backendowych testów
  AuthRegistrationIntegrationTest zakończyło się powodzeniem.
- Dzwonek powiadomień jest ukryty dla gości i widoczny po udanym logowaniu;
  pozostaje nieaktywny. Stan jest reaktywny, wyłącznie w pamięci, zgodnie z #16.
- Instrukcja startu i wyniki: `LOCAL-INTEGRATION-CHECK.md`. Użytkownik potwierdził
  działanie formularzy i zatwierdził publikację do przeglądu. Merge wymaga
  pozytywnych kontroli i review zgodnie z CONTRIBUTING.
