import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <>
      <section className="hero content-width" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" aria-hidden="true" />
            Wspólne sesje programowania
          </p>
          <h1 id="home-title">
            Jedno lobby. <br />
            <span>Wiele rozwiązań.</span>
          </h1>
          <p className="hero-description">
            Uczcie się od siebie, rozwiązując zadania razem. Wspólna przestrzeń
            na laboratoria, warsztaty i kolejną dobrą myśl w kodzie.
          </p>
          <div className="actions">
            <Link className="button button--primary" to="/register">
              Przejdź do rejestracji <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" to="/login">
              Przejdź do logowania <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="hero-note">
            Aplikacja jest w przygotowaniu. Konta i sesje będą dostępne w
            kolejnych etapach.
          </p>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="code-sheet">
            <div className="code-sheet-header">
              <span className="code-dots">● ● ●</span>
              <span>miejsce na Twój pomysł</span>
            </div>
            <div className="code-sheet-body">
              <div>
                <span className="line-number">01</span>
                <span className="code-comment">
                  // Od pomysłu do rozwiązania.
                </span>
              </div>
              <div>
                <span className="line-number">02</span>
              </div>
              <div>
                <span className="line-number">03</span>
                <span className="code-keyword">while</span> (learning) {'{'}
              </div>
              <div>
                <span className="line-number">04</span> explore();
              </div>
              <div>
                <span className="line-number">05</span> share();
              </div>
              <div>
                <span className="line-number">06</span> improve();
              </div>
              <div>
                <span className="line-number">07</span>
                {'}'}
              </div>
            </div>
            <div className="code-sheet-footer">
              <span className="status-dot" />
              Każdy pomysł ma swój początek.
            </div>
          </div>
          <span className="visual-caption">RÓŻNE PODEJŚCIA. WSPÓLNY CEL.</span>
        </div>
      </section>
      <section
        className="intro-section content-width"
        aria-labelledby="intro-title"
      >
        <div className="section-intro">
          <p className="eyebrow">Prosta idea</p>
          <h2 id="intro-title">
            Razem łatwiej <br />
            znaleźć rozwiązanie.
          </h2>
          <p>
            CodeLobby powstaje z myślą o nauce przez praktykę — od pierwszej
            linijki po wspólną analizę rozwiązania.
          </p>
        </div>
        <ol className="steps">
          <li>
            <span className="step-number">01</span>
            <div>
              <h3>Jedna przestrzeń</h3>
              <p>
                Host przygotowuje lobby i zadania. Uczestnicy dołączają do
                konkretnej sesji.
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">02</span>
            <div>
              <h3>Własne podejście</h3>
              <p>
                Każdy pracuje nad swoim rozwiązaniem w edytorze przeglądarkowym.
              </p>
            </div>
          </li>
          <li>
            <span className="step-number">03</span>
            <div>
              <h3>Informacja zwrotna</h3>
              <p>
                Docelowo testy i wyniki pomogą sprawdzić kod i zrobić następny
                krok.
              </p>
            </div>
          </li>
        </ol>
      </section>
      <div className="content-width development-note">
        <span aria-hidden="true">↳</span>
        <p>
          Host i Uczestnik to role w danym lobby. Jedno konto może pełnić różne
          role w różnych sesjach.
        </p>
      </div>
    </>
  );
}
