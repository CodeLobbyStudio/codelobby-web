import { Link } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { EmptyState } from '../../shared/components/EmptyState';

export function ProfilePage() {
  return (
    <>
      <p className="eyebrow">Konto / profil</p>
      <h1>Profil</h1>
      <p className="page-description">
        Wszystko, co dotyczy Twojego konta, w jednym miejscu.
      </p>
      <Alert title="Podgląd części konta">
        <p>
          To widok w przygotowaniu. Nie masz tutaj aktywnej sesji. Dane profilu
          pojawią się po wdrożeniu logowania i obsługi konta.
        </p>
      </Alert>
      <EmptyState
        title="Twój profil jest jeszcze przed nami"
        description="Tutaj znajdziesz informacje o swoim koncie, gdy logowanie będzie dostępne. Na razie możesz poznać CodeLobby na stronie głównej."
        action={
          <Link className="button button--secondary" to="/">
            Wróć na stronę główną
          </Link>
        }
      />
    </>
  );
}
