import { Button } from './Button';

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <section
      className="state-panel state-panel--error"
      aria-label="Błąd widoku"
    >
      <span className="state-symbol" aria-hidden="true">
        !
      </span>
      <h2>Nie udało się wyświetlić tej części strony</h2>
      <p>
        Spróbuj ponownie. Jeśli problem się powtarza, wróć na stronę główną.
      </p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Spróbuj ponownie
        </Button>
      )}
    </section>
  );
}
