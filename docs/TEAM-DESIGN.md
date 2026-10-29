# Uzgodniony wygląd CodeLobby

Źródło: dwa screeny przekazane przez użytkownika. Zastępują poprzedni jasny,
zielony kierunek wizualny. Nie publikować zmian ani PR bez wyraźnej zgody użytkownika.

## Kompozycja

- Tło prawie czarne, granatowo-zielone; miękkie pomarańczowe poświaty i długie,
  cienkie łuki światła między sekcjami. Biały tekst, szare opisy, pomarańczowe akcenty.
- Zwarty, zaokrąglony pasek nagłówka odsunięty od krawędzi. Świecący symbol `</>`,
  nazwa CodeLobby (Lobby pomarańczowe), Zadania, Lobby, Ranking, Dla prowadzących,
  dzwonek, Zaloguj się i pomarańczowe Załóż konto.
- Hero: po lewej mały rozstrzelony napis LIVE CODING DLA UCZELNI; trzy linie Koduj.
  Rywalizuj. Rozwijaj się. (ostatnia pomarańczowa), opis platformy, Utwórz lobby →
  i Dołącz kodem. Po prawej duży, lekko pochylony ciemny podgląd aplikacji.
- Pod hero trzy kolumny oddzielone cienkimi liniami, każda z krótką pomarańczową
  kreską: Live coding, Automatyczne testy, Ranking rozwiązań i opisy ze screena.
- Sekcja JAK TO DZIAŁA?: wyśrodkowane Od lobby do wyników / w kilku krokach.
  Cztery ponumerowane kafle w siatce 2 × 2, na telefonie jedna kolumna:
  Utwórz lobby (użytkownicy), Koduj w przeglądarce (kod), Automatyczne testy
  (plik z haczykiem), Zobacz wyniki (wykres). Automatyczna wysokość kart,
  ciemne powierzchnie i subtelne obramowania.
- DLA PROWADZĄCYCH: Pełna kontrola / nad zajęciami, opis, Dowiedz się więcej →.
  Po prawej duży neonowy `</>` w odcieniach pomarańczowego, czerwieni i różu,
  ze światłem odbitym pod spodem.
- Stopka: logo, © 2026 CodeLobby, Polityka prywatności, Regulamin, Kontakt, FAQ
  i symbole GitHub, Discord, YouTube, X.

## Podgląd edytora (pierwszy screen jest zbliżeniem)

- Trzy lampki okna, CodeLobby i breadcrumb Lobby › Algorytmy › Zadanie 2.
- Timer 00:42:17 z ikoną stopera w prawym górnym rogu.
- Lewa kolumna: Opis (aktywna, pomarańczowa kreska), Przykłady, Testy;
  Najdłuższy podciąg; opis, Wejście, Wyjście i rozwinięte Ograniczenia.
- Środek: Python 3.11, pomarańczowe Uruchom, Wyślij. Ciemny edytor,
  numery linii i kolorowanie składni funkcji najdluzszy_podciag(arr).
- Dół środka: Testy (aktywna), Konsola; cztery zielone wyniki Zaliczone,
  Test 4 (ukryty), czasy 0, 8, 16, 94 ms.
- Prawa kolumna: Uczestnicy (7/20), kolorowe kropki, Ty, Kaczan, PawełBM,
  Oliwka, Simon, Zuzu, Mek. Niżej Ranking: #, Użytkownik, Wynik, Czas;
  paweldM 100 / 52 ms, Kaczan 90 / 67 ms, Ty 74 / 112 ms (pomarańczowy wiersz),
  gregos 64 / 181 ms, polka 60 / 198 ms.

## Ograniczenia implementacji

Podgląd jest statyczną ilustracją, nie rzeczywistym lobby ani danymi użytkownika.
Nie dodawać pozornych endpointów ani wykonywania kodu. Linki logowania/rejestracji
korzystają z istniejących tras; sekcje marketingowe mają działające kotwice.
Przyszłe akcje lobby pokazują komunikat o dostępności. Nie wymyślać adresów social
ani treści prawnych. Zachować mobilny reflow, kontrast, focus i reduced motion.

## Weryfikacja lokalna po zmianach

- Build, lint, sprawdzenie formatowania i 35 testów przeszły.
- Podgląd porównano z referencjami na desktopie; sprawdzono szerokości 390 i 320 px,
  bez poziomego przewijania dokumentu.
- Sprawdzono nawigację do logowania/rejestracji, profil, 404 i powrót do landing,
  skip link klawiaturą oraz informację po kliknięciu Utwórz lobby.
- Kontrast podstawowego tekstu na tle strony: 17.85:1, tekstu pomocniczego 10.61:1,
  pomarańczowego akcentu 9.72:1, tekstu przycisku na jego ciemniejszym końcu 8.58:1.
- Ozdobny podgląd edytora i neonowy symbol wykonano w HTML/CSS/SVG; bez
  wykonywania kodu uczestnika i bez nowych połączeń z backendem.
  Fonty Inter i Space Grotesk są dostarczane lokalnie przez pakiety Fontsource.
- Zmiany są lokalne. Nie wykonano commita, pushu ani aktualizacji PR po przekazaniu
  przez użytkownika zasady publikacji wyłącznie na jego wyraźne polecenie.

## Uzupełnienie po przeglądzie UI

Szczegółowe rozstrzygnięcie uwag i ograniczenia weryfikacji: [UI-REVIEW.md](UI-REVIEW.md).
Podgląd edytora można powiększyć w natywnym oknie dialogowym; Escape zamyka
okno i przywraca focus. Na mniejszych ekranach nawigacja pozostaje widoczna i zawija się do wyśrodkowanych wierszy.
Przewijanie sekcji ma animację 650 ms, zgodnie z wyraźną decyzją użytkownika również przy systemowym ograniczeniu ruchu; Zadania centrują rząd funkcji.

## Drugi przegląd UI

Cały mockup otwiera modal klawiaturą i myszą. Nagłówek modala pozostaje widoczny,
treść przewija się osobno, a telefon pokazuje jedną kolumnę paneli. Stopka ma
siatkę trzech kolumn, a aktywna sekcja przestaje być podświetlana po opuszczeniu
viewportu. Rząd funkcji opisuje możliwości, cztery kroki opisują proces.
W demo wszystkie pokazane wyniki to 100, kolejność wynika z czasu. Opis wejścia
odnosi się do argumentu arr, a inicjały zastępują nieopisane kropki uczestników.

Po ponownym wyborze użytkownika przywrócono wcześniejsze teksty kroków: kodowanie
w wybranym języku bez instalacji, Automatyczne testy z natychmiastową weryfikacją
oraz porównanie czasu, poprawności i jakości kodu w rankingu lobby.
Układ i numeracja kart pozostają bez zmian.

Naprawiono ponowne przewijanie po odświeżeniu: stan nawigacji zapisany przed
uruchomieniem strony nie uruchamia animacji ani podświetlenia. Nowe kliknięcia
nadal przewijają płynnie. Przy uruchomieniu scroll jest resetowany do góry,
a obramowanie focusu całych sekcji jest wyłączone. Sprawdzono scenariusz
Lobby → ręczne przewinięcie → refresh: scrollTop = 0, brak aktywnego linku.

Na życzenie użytkownika inicjały zastąpiono różnokolorowymi kropkami. Simon
ma w demo 75 punktów i czas 60 ms; pozostaje za osobami ze 100 punktami,
ponieważ wynik jest ważniejszy niż czas. Cztery zaliczone testy dotyczą Ty.

Dopracowano hierarchię prawego panelu: dane rankingu i lista uczestników mają
w modalu 14 px, nagłówki tabeli 12 px i słabszy akcent. Wyróżnienie Ty jest
pomarańczowe w obu miejscach; kolory kropek są mocniej rozróżnione. Wyślij ma
obramowanie i tło, statusy testów są obok czasu, dolna zakładka to Wyniki.
Czas Ty wynosi 118 ms i jest obliczany z pokazanych czasów testów. Rozjaśniono
numery linii, a pasek narzędzi może zawijać akcje na wąskim ekranie.

Lista podglądu pokazuje 19/20 uczestników, maksymalnie 10 wierszy jednocześnie,
z niezależnym przewijaniem (również klawiaturą w modalu). Ranking jest na dole
prawego panelu. Zielony oznacza Wysłano (5 osób z rankingu), pomarańczowy
W trakcie (11 osób), a szary Nie rozpoczęto (3 ostatnie osoby). Niebieski
stan jest pominięty. Legenda i dostępne opisy wyjaśniają znaczenie kolorów.
Ty ma w liście ciemne tło z pomarańczowym obramowaniem, by kropki były czytelne.
