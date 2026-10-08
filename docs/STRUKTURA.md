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

Jak wybierzemy dokładny setup Reacta, dołożymy pliki startowe i konfigurację.
