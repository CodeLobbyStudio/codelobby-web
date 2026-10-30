import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="not-found content-width">
      <p className="eyebrow">Nie ten adres</p>
      <span className="not-found-code" aria-hidden="true">
        404<span>.</span>
      </span>
      <h1>Nie znaleziono strony</h1>
      <p>
        Ten adres prowadzi poza lobby.
        <br />
        Wróć na początek i wybierz swoją drogę.
      </p>
      <Link className="button button--primary" to="/">
        Wróć na stronę główną <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
