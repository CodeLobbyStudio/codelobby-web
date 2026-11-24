import { Link } from 'react-router-dom';
import { WorkflowJourney } from '../components/WorkflowJourney';
import { EditorIllustration } from '../components/EditorIllustration';
import { NeonCode } from '../../shared/components/NeonCode';
import { LightRibbon } from '../components/LightRibbon';

export function HomePage() {
  return (
    <div className="landing-page">
      <section className="hero-stage glow-divider">
        <LightRibbon variant="hero" />
        <div className="hero content-width" aria-labelledby="home-title">
          <div className="hero-copy">
            <p className="eyebrow">Live coding dla uczelni</p>
            <h1 id="home-title">
              Koduj. <br />
              Rywalizuj. <br />
              <span>Rozwijaj się.</span>
            </h1>
            <p className="hero-description">
              CodeLobby to platforma do uczelnianych sesji kodowania na żywo.
            </p>
            <div className="actions">
              <Link
                className="codelobby-button button--primary"
                to="/lobbies/new"
              >
                Utwórz lobby <span aria-hidden="true">→</span>
              </Link>
              <Link
                className="codelobby-button button--secondary"
                to="/lobbies/join"
              >
                Dołącz kodem
              </Link>
            </div>
          </div>
          <EditorIllustration />
        </div>
      </section>
      <section
        className="features content-width"
        id="funkcje"
        tabIndex={-1}
        aria-label="Możliwości CodeLobby"
      >
        <article>
          <h2>Live coding</h2>
          <p>
            Twórz lobby, rozwiązuj zadania i rywalizuj w czasie rzeczywistym.
          </p>
        </article>
        <article>
          <h2>Automatyczne testy</h2>
          <p>
            Uruchamiaj publiczne testy Java i sprawdzaj wynik każdego przypadku.
          </p>
        </article>
        <article>
          <h2>Edytor projektu</h2>
          <p>
            Otwieraj pliki z drzewa projektu i przełączaj się między zakładkami.
          </p>
        </article>
      </section>
      <section
        className="how-section glow-divider"
        id="jak-to-dziala"
        tabIndex={-1}
        aria-labelledby="how-title"
      >
        <WorkflowJourney />
      </section>
      <section
        className="teacher-section glow-divider"
        id="dla-prowadzacych"
        tabIndex={-1}
        aria-labelledby="teacher-title"
      >
        <div className="teacher-layout content-width">
          <div className="teacher-copy">
            <p className="eyebrow">Dla prowadzących</p>
            <h2 id="teacher-title">
              Pełna kontrola <br />
              <span>nad zajęciami</span>
            </h2>
            <p>
              Importuj pliki zadania, zapraszaj uczestników i zarządzaj czasem
              sesji.
            </p>
            <Link className="codelobby-button button--primary" to="/lobbies">
              Moje lobby <span aria-hidden="true">→</span>
            </Link>
          </div>
          <NeonCode />
        </div>
        <LightRibbon variant="teacher" />
      </section>
    </div>
  );
}
