import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { session } from './session';

export function SessionRecovery() {
  return (
    <section className="auth-layout content-width">
      <h1>Sprawdzenie sesji</h1>
      <Alert title="Nie udało się potwierdzić sesji" variant="error" announce>
        Spróbuj ponownie lub wróć do logowania.
      </Alert>
      <div className="actions">
        <Button onClick={() => void session.restore()}>Spróbuj ponownie</Button>
        <Button variant="secondary" onClick={() => session.logout()}>
          Wróć do logowania
        </Button>
      </div>
    </section>
  );
}
