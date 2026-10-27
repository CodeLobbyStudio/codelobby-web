import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';

function AppShell() {
  return (
    <>
      <a className="skip-link" href="#main">
        Przejdź do treści
      </a>
      <header className="site-header">
        <Link className="brand" to="/" aria-label="CodeLobby — strona główna">
          CodeLobby
        </Link>
        <nav aria-label="Nawigacja główna">
          <NavLink to="/login">Logowanie</NavLink>
          <NavLink to="/register">Rejestracja</NavLink>
          <NavLink to="/profile">Profil</NavLink>
        </nav>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}

function HomePage() {
  return (
    <>
      <p className="eyebrow">Wspólne sesje programowania</p>
      <h1>Jedno lobby. Wiele rozwiązań.</h1>
      <p>
        CodeLobby to miejsce do wspólnej pracy nad zadaniami podczas
        laboratoriów i warsztatów programistycznych.
      </p>
      <p>
        Możesz prowadzić sesję jako Host lub dołączyć do niej jako Uczestnik.
        Twoja rola zależy od konkretnego lobby.
      </p>
      <p className="notice">
        Przygotowujemy aplikację. Logowanie, rejestracja i lobby będą dostępne w
        kolejnych etapach.
      </p>
      <div className="actions">
        <Link to="/login">Przejdź do logowania</Link>
        <Link to="/register">Przejdź do rejestracji</Link>
      </div>
    </>
  );
}

function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <p className="eyebrow">W przygotowaniu</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <Link to="/">Wróć na stronę główną</Link>
    </>
  );
}

function NotFoundPage() {
  return (
    <>
      <p className="eyebrow">404</p>
      <h1>Nie znaleziono strony</h1>
      <p>Sprawdź adres lub wróć na stronę główną.</p>
      <Link to="/">Wróć na stronę główną</Link>
    </>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route
          path="login"
          element={
            <ComingSoonPage
              title="Logowanie"
              description="Formularz logowania pojawi się w kolejnym etapie."
            />
          }
        />
        <Route
          path="register"
          element={
            <ComingSoonPage
              title="Rejestracja"
              description="Formularz zakładania konta pojawi się w kolejnym etapie."
            />
          }
        />
        <Route
          path="profile"
          element={
            <ComingSoonPage
              title="Profil"
              description="Profil będzie dostępny po wdrożeniu logowania i obsługi sesji."
            />
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
