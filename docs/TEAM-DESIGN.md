# Uzgodniony wygląd CodeLobby

Źródło: dwa screeny przekazane przez użytkownika. Zastępują poprzedni jasny,
zielony kierunek wizualny. Nie publikować zmian ani PR bez wyraźnej zgody użytkownika.

## Kompozycja

### Dopracowanie wizualne po PR #22 (lokalnie, do odbioru)

- Referencja ruchu: Logo Hero na https://shaders.com/; efekt realizujemy na własnym
  SVG i CSS, bez nowej biblioteki lub zależności od zewnętrznej usługi.
- Neon w sekcji prowadzących podąża za kursorem z łagodnym wygaszaniem ruchu.
  W dotyku nie śledzi kursora; pulsowanie poświaty trwa 5,5 sekundy, a kolory
  płynnie krążą między pomarańczem, czerwienią i różem w cyklu 12 sekund,
  bez szybkich błysków. Użytkownik wyraźnie zatwierdził tę delikatną animację
  także przy systemowym ograniczeniu ruchu, analogicznie do nawigacji sekcji.
  Cały obrys używa ciągłego animowanego gradientu, bez przerywanej nakładki,
  która kończyła przebieg przed domknięciem wszystkich trzech części symbolu.
- Mały podgląd ma delikatne nachylenie 2D (-1,2 stopnia), bez perspektywy
  i obrotu w osi Y. Zastępuje wcześniejszą wersję 3D na życzenie użytkownika,
  żeby ograniczyć artefakty krawędzi przy zachowaniu lekkiego nachylenia.
  Rozwinięty podgląd nadal pozostaje płaski i czytelny.
  W małym rankingu wiersz „Ty” ponownie ma pomarańczowe tło i kreskę po lewej
  od indeksu, bez jasnej obwódki. Kreska w małym rankingu jest osobnym
  pseudoelementem pierwszej komórki, tak jak w uczestnikach, i nie przesuwa
  kolumn. Po przejściu na obrót 2D tło jest zwykłym
  wypełnieniem wiersza, bez osobnej rozmytej warstwy wystającej po prawej.
  „Ty” jest na pierwszym miejscu (100 punktów, 52 ms), Kaczan na drugim (67 ms),
  PawełBM na trzecim (118 ms). Czasy testów Ty wynoszą 0, 8, 16 i 28 ms.
- Po wyborze szkicu 04 użytkownik zaproponował docelowo cztery schodki rosnące
  od lewej do prawej. `WorkflowJourney` realizuje ten kierunek: wspólna podstawa,
  nagłówek nad pierwszymi krokami i wyróżniony ostatni stopień.
  Stopnie mają równe przyrosty po 64 px, a miniilustracje pokazują kod lobby,
  fragment Python, testy i samo podium. Tabela rankingu pozostaje tylko w hero
  i powiększonym podglądzie. Kod, przypadki testowe i czasy są współdzielone
  przez `lobbyDemo.ts`; karta testów pokazuje trzy konkretne tablice i ich wyniki.
  Podium ilustruje zakończoną sesję z „Ty” na pierwszym miejscu; hero i modal
  nadal pokazują sesję w trakcie, również z Ty na pierwszej pozycji. W finale hasło „Sięgnij po
  pierwsze miejsce” zastępuje opis przykładu. Podium ma wysokość 200 px, a ramka
  karty ma mocniejszy pomarańczowy akcent i delikatną poświatę. Zwycięski słupek wyróżniają
  pomarańczowe tło, ramka i puchar oraz duży napis „Ty” (24 px).
  Drugie i trzecie miejsce mają tylko numery, bez nicków. Chip ma podpis
  „Kod dołączenia”, a kod pokazuje wybraną przez użytkownika pętlę z `zip`
  szukającą najdłuższego rosnącego fragmentu, z zachowanymi wcięciami. Tekst miniilustracji ma
  co najmniej 12 px. Doły wszystkich czterech miniilustracji są wyrównane.
  Sekcję zamyka większe, jaśniejsze zdanie „Od wspólnego zadania do wspólnych
  wyników.”, bez powielonego przycisku tworzenia lobby.
  Poniżej 80 rem schody przechodzą w pionową oś czasu z lekkimi wcięciami,
  żeby nagłówek i kod nie kolidowały na węższych laptopach. Bez obietnic czasu
  uruchomienia, których jeszcze nie zmierzono.
- Linki Lobby i Ranking centrują zawartość „Jak to działa” w oknie, bez
  uwzględniania zewnętrznych odstępów sekcji. Gdy zawartość jest wyższa niż
  ekran, przewijanie pokazuje jej początek zamiast środkowych kroków.
- Pozostają łuki pod hero i sekcją prowadzących. Pod schodami nie ma poziomej
  linii ani poświaty, żeby zaokrąglone dolne rogi kart pozostały widoczne.
- Poświaty tła obejmują całą stronę główną wraz ze stopką, zamiast urywać się
  na granicach sekcji. Stopka landingu jest przezroczysta, a odbicie neonu
  zanika miękko. Pierwszy łuk jest podniesiony o 2 rem względem pierwotnej wersji.
  Odbicie pod neonem jest rozmytą elipsą SVG, która używa tego samego gradientu
  co symbol, więc kolory pozostają zsynchronizowane bez osobnych animacji.
- Treści, funkcjonalność demonstracji i zakres issue pozostają zachowane.
  Nie publikować tych zmian bez kolejnego zatwierdzenia użytkownika.

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
