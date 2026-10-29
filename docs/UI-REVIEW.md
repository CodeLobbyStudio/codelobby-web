# Weryfikacja uwag do landing page i logowania

Uwagi z dostarczonego tekstu porównano z kodem i działającą stroną.
Referencje zespołu pozostają kierunkiem wizualnym; poprawki dotyczą czytelności,
układu i dostępności. Zmiany nie dodają logowania ani API z kolejnych ticketów.

## Ocena i decyzje

| Uwaga                                     | Wynik weryfikacji i zmiana                                                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nakładające się karty                     | Potwierdzono. Stałe wiersze i przesunięcia zastąpiono siatką 2 × 2 o automatycznej wysokości; na telefonie jedna kolumna. Dodano numerację 01–04 i semantyczną listę uporządkowaną.                                                                              |
| Stale widoczny skip-link                  | Bez focusu link był poza viewportem. Pełnostronicowy zrzut mógł jednak pokazać element przesunięty poza viewport. Ukrywanie wzmocniono przez przycięcie; link nadal pojawia się przy focusie klawiatury.                                                         |
| Różne krawędzie kontenerów                | Potwierdzono. Wspólna maksymalna szerokość i marginesy treści, logo nagłówka i stopki; usunięto odrębną skalę logo stopki.                                                                                                                                       |
| Kropka przy dzwonku                       | Była osobną ikoną lokalizacji bez funkcji. Usunięta.                                                                                                                                                                                                             |
| Oderwane smugi                            | Były zamierzoną dekoracją. Usunięto smugi przy ilustracji, pozostawiając subtelne łuki między sekcjami.                                                                                                                                                          |
| Przesunięte kreski nad funkcjami          | Potwierdzono. Kreski wyrównano z tekstem.                                                                                                                                                                                                                        |
| Typografia i drobna nawigacja             | Potwierdzono użycie fontu systemowego i małych rozmiarów. Dodano lokalne fonty Inter i Space Grotesk z polskimi znakami, etykiety od 12 px oraz nawigację 14 px. Rozmiary tekstu używają rem.                                                                    |
| Za niski kontrast wszystkich opisów       | Nie potwierdzono uogólnienia. Podstawowy tekst pomocniczy #b9c1c9 na #070f14 ma około 10.61:1, a tekst główny około 17.85:1. Nie rozjaśniano całej palety bez potrzeby. Nie jest to pełny audyt WCAG wszystkich stanów.                                          |
| Mały i przechylony edytor                 | Zasadna uwaga o czytelności. Zmniejszono przechylenie, na tabletach i telefonach wyłączono je; osobny przycisk otwiera większy statyczny podgląd. Na małym ekranie przewija się zawartość podglądu, a nie cały dokument.                                         |
| Timer poza ilustracją                     | Nie potwierdzono: jest wewnątrz nagłówka ilustracji. Zachowano.                                                                                                                                                                                                  |
| Usunięcie neonowego symbolu               | Kwestia preferencji, sprzeczna z zaakceptowaną referencją zespołu. Zachowano symbol i kolory. Główne przyciski mają prostsze, jednolite tło.                                                                                                                     |
| Ręczne łamanie opisów i odstępy           | Usunięto ręczne br z opisów marketingowych, uporządkowano odstępy i szerokości tekstu. Łamanie głównego hasła pozostaje zamierzone.                                                                                                                              |
| Nadmiar treści na logowaniu               | Uproszczono do jednej karty z informacją o etapie prac, przejściem do drugiej trasy konta i powrotem na stronę główną. Prawdziwe formularze należą do #16, więc nie dodano atrap ani nie usunięto wymaganych tras.                                               |
| Brak aktywnej nawigacji                   | Dodano widoczny stan aktywnej trasy i wybranej kotwicy, oparty na aria-current. Wybór sekcji w nagłówku nie dodaje fragmentu do URL; Ranking prowadzi obecnie do tej samej sekcji co Lobby. Nie jest to śledzenie aktualnej sekcji podczas ręcznego przewijania. |
| Mieszanka języków                         | Stopka jest po polsku; poprawiono „Twórz lobby” i „sesji kodowania na żywo”. Nazwa produktu i termin Live coding pozostają.                                                                                                                                      |
| Zoom i jednostki px                       | Twierdzenie, że px nie skaluje się przy zoomie przeglądarki, jest nieprawidłowe. Rem pomaga również przy zmienionym domyślnym rozmiarze tekstu. Nawigacja jest zawsze widoczna i zawija się do wyśrodkowanych wierszy. Usunięto stałe wysokości siatki.          |
| Treść przyklejona do lewej przy oddaleniu | Nie potwierdzono: kontenery były już centrowane. Ujednolicono ich szerokości; sprawdzono również szeroki viewport 1920 px.                                                                                                                                       |

## Weryfikacja

- Build, ESLint, Prettier i 35 testów. Przypadki sprawdzają pośrednie klatki animacji, jej przerwanie i centrowanie funkcji,
  widoczność nawigacji, aktywną sekcję i wyjście ze strony logowania.
- Ręcznie w przeglądarce: szerokości 320, 375, 640, 768, 1280 i 1920 px,
  brak nakładania kart i poziomego przewijania dokumentu; działanie kotwic,
  nawigacji, powiększenia ilustracji i Escape z powrotem focusu do przycisku.
- Zrzuty przed/po wykonano dla landing page i logowania; dodatkowo mobile/tablet.
- Wąski reflow nie jest dowodem testu natywnego zoomu 200%. Ten test pozostaje
  do ręcznego potwierdzenia w przeglądarce z działającą kontrolą zoomu.
- Brak commita, pushu i publikacji PR w ramach tego przeglądu.

## Drugi przegląd: stopka i podgląd lobby

- Potwierdzono brak stałych kolumn stopki oraz utrzymujące się podświetlenie
  ostatnio klikniętej sekcji. Stopka ma teraz siatkę logo/linki/ikony, copyright
  osobno pod logo, a IntersectionObserver usuwa aktywność sekcji poza viewportem.
- Etykiety wcześniej miały 12 px i wystarczający kontrast; nie potwierdzono
  ogólnego zarzutu niskiego kontrastu. Podniesiono je jednak do 13 px i rozjaśniono.
  Usunięto znak zapytania z „Jak to działa”.
- Zachowano oba bloki marketingowe: funkcje opisują możliwości, kroki działania
  opisują proces. Krok trzeci to teraz „Wyślij rozwiązanie”.
- Cała ilustracja otwiera podgląd (kliknięcie, Enter, Spacja), osobny przycisk
  usunięto. Modal ma zwarty nagłówek z oznaczeniem Ilustracja i ikoną zamknięcia,
  mocniej zaciemnione oraz rozmyte tło, przewijane wnętrze i blokadę scrolla strony.
  Escape i kliknięcie poza modalem zamykają go; focus wraca do mockupu.
- Telefon pokazuje czytelne panele w jednej kolumnie. Zrezygnowano z instrukcji
  przewijania całego edytora poziomo. Nagłówek i zamknięcie są zawsze dostępne.
- Check w kółku był już obecny, ale przy małej skali mógł wyglądać jak pinezka.
  Zastąpiono znaki tekstowe ikonami SVG: check-circle, play, send i chevron.
  Usunięto pozorne przyciski zamknięcia paneli oraz lampki okna w modalu.
- Wyrównano nagłówki i liczby rankingu, ustalono kolumny testów, zwiększono
  nagłówki tabel. Uczestnicy mają inicjały; Ty jest wyróżnione również na liście.
- Cztery zaliczone testy i 74 punkty nie dowodzą błędu bez reguł punktacji,
  ale demo nie wyjaśniało tej różnicy. Ustawiono 100 punktów i ranking według czasu,
  spójne nazwy uczestników oraz opis argumentu funkcji zamiast formatu stdin.
- Potwierdzono ręcznie Escape, kliknięcie tła, powrót focusu, otwieranie Enter
  i Spacją, układ telefonu 375 × 667 oraz przewijanie modala przy 1280 × 450.

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

## Przegląd responsywności — 2026-10-29

- Miniatura poniżej 720 px pokazuje fragment kodu i pierwsze trzy miejsca rankingu.
  Całość otwiera pełny podgląd; akcję wyróżnia etykieta z lupą. Legenda statusów
  jest wyświetlana tylko w powiększeniu.
- W modalu lista uczestników przechodzi na dwie kolumny, gdy panel ma co najmniej
  16 rem szerokości. Widać maksymalnie dziesięć osób (pięć rzędów), pozostali
  są dostępni przez niezależne przewijanie. Na węższym panelu zostaje jedna kolumna.
- Ty ma w obu listach to samo półprzezroczyste pomarańczowe tło i lewy pasek.
  Przewijane obszary mają ciemne paski. Lewa zakładka to Przypadki testowe.
- Funkcje i sekcja prowadzących przechodzą do jednej kolumny do 720 px.
  Zachowano zawijaną nawigację bez hamburgera, wyśrodkowany tytuł kroków,
  numerację kart, wybrane teksty oraz neonową ilustrację prowadzących.
- Usunięto skośne linie dzielące sekcje i boczną smugę hero. Wzmocniono krawędzie
  kart. Etykiety nad nagłówkami mają 13 px, stopka 14 px, a jej akcje co najmniej
  44 px wysokości. Powrót z logowania/rejestracji ma słabszy akcent.
- Dodano favicon SVG i ciemny theme-color. Obraz OG pozostaje do przygotowania
  po ustaleniu docelowej domeny i finalnej grafiki udostępniania.
- Dzwonek pozostaje teraz widoczny zgodnie z decyzją użytkownika. Przy wdrażaniu
  sesji należy pokazywać go wyłącznie zalogowanym i podłączyć prawdziwe powiadomienia.
- Sprawdzono szerokości 320, 375, 720, 768, 1280, 1920 i 2560 px bez poziomego
  przewijania strony oraz rzeczywisty zoom 200% i 400% w Zen. Modal przy 1280 × 768
  pokazuje cały ranking i cztery testy; przy 320 × 568 przewija się niezależnie
  z dostępnym nagłówkiem i zamknięciem. Potwierdzono Enter, Escape i powrót fokusu.

## Poprawki podglądu zadania — 2026-10-29

Ranking w modalu znajduje się bezpośrednio pod listą uczestników, bez wypychania
na dół kolumny. Dwukolumnowa lista pokazuje do 16 osób przed przewinięciem.
Usunięto pionowy pomarańczowy pasek przy Ty z listy i rankingu; pozostało tło.

Powiększony podgląd udostępnia zakładki Opis, Przykłady i Przypadki testowe,
obsługiwane myszą oraz strzałkami, Home i End. Przykłady obejmują wzrost,
ciąg malejący oraz powtarzające się wartości. Trzy jawne testy mają dane
wejściowe i oczekiwane wyniki; czwarty pozostaje ukryty. Dane są demonstracyjne,
a kod nie jest uruchamiany. Dłuższa treść na desktopie ma osobne przewijanie,
żeby zmiana zakładki nie rozciągała edytora i rankingu.

W nagłówku podglądu dodano Przejdź do zadania 3 →. Zgodnie z decyzją użytkownika
jest to wyłącznie element ilustracji; w modalu ma stan disabled i nie zmienia zadania.

W kolejnym przeglądzie skrócono nazwę trzeciej zakładki miniatury do Testy
(pełna nazwa pozostaje w modalu). Przyciski zadań mają neutralne szare
obramowanie; nagłówek ilustracji na desktopie mieści logo, breadcrumb,
przyciski i timer w jednym rzędzie. Przy 1280 × 768 ranking i cztery wyniki
mieszczą się bez przewijania głównej części modala. Zgodnie z nowszą decyzją
wyróżnienie Ty rozjaśniono do około 19% pomarańczu i przywrócono cienki lewy
pasek, z dodatkowym odstępem od kropki uczestnika oraz numeru w rankingu.
Konsola, Uruchom, Wyślij i nawigacja między zadaniami są disabled.

Ujednolicono nazwę zakładki Testy w miniaturze i modalu. Przyciski zadań
w miniaturze są dosunięte do zegara przez wspólny układ nagłówka. Cała pierwsza
kolumna rankingu (# i indeksy 1–5) ma większy odstęp od lewego brzegu;
w modalu liczby zaczynają się na tej samej osi co kropki uczestników.
Pasek wyróżnienia w rankingu zwężono do 1 px.
