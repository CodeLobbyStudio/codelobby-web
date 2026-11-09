import { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Alert } from '../../shared/components/Alert';
import { WorkflowJourney } from '../components/WorkflowJourney';
import { EditorIllustration } from '../components/EditorIllustration';
import { NeonCode } from '../../shared/components/NeonCode';
import { LightRibbon } from '../components/LightRibbon';

export function HomePage() {
  const [notice, setNotice] = useState('');
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
              <Button
                onClick={() =>
                  setNotice(
                    'Tworzenie lobby będzie dostępne w kolejnym etapie.',
                  )
                }
              >
                Utwórz lobby <span aria-hidden="true">→</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  setNotice(
                    'Dołączanie kodem będzie dostępne w kolejnym etapie.',
                  )
                }
              >
                Dołącz kodem
              </Button>
            </div>
            {notice && (
              <div className="hero-notice">
                <Alert title="W przygotowaniu" announce>
                  {notice}
                </Alert>
              </div>
            )}
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
            Natychmiastowa weryfikacja rozwiązań na jawnych i ukrytych testach.
          </p>
        </article>
        <article id="ranking">
          <h2>Ranking rozwiązań</h2>
          <p>
            Sprawdź, jak wypadasz na tle innych pod względem wydajności i
            jakości kodu.
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
              Twórz zadania, zarządzaj uczestnikami i śledź postępy w czasie
              rzeczywistym. Idealne do ćwiczeń, kolokwiów i konkursów.
            </p>
            <a className="button button--primary" href="#jak-to-dziala">
              Dowiedz się więcej <span aria-hidden="true">→</span>
            </a>
          </div>
          <NeonCode />
        </div>
        <LightRibbon variant="teacher" />
      </section>
    </div>
  );
}
