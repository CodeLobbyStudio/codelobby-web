import { useState } from 'react';
import { Button } from '../../shared/components/Button';
import { Alert } from '../../shared/components/Alert';
import { Icon } from '../../shared/components/Icon';
import { EditorIllustration } from '../components/EditorIllustration';
import { NeonCode } from '../components/NeonCode';

export function HomePage() {
  const [notice, setNotice] = useState('');
  return (
    <>
      <section className="hero-stage glow-divider">
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
        <div className="content-width">
          <div className="section-heading">
            <p className="eyebrow">Jak to działa</p>
            <h2 id="how-title">
              Od lobby do wyników <br />w kilku krokach
            </h2>
          </div>
          <ol className="workflow-grid" aria-label="Etapy pracy w CodeLobby">
            <li className="workflow-card workflow-lobby">
              <span className="step-number" aria-hidden="true">
                01
              </span>
              <Icon name="users" />
              <h3>Utwórz lobby</h3>
              <p>Wybierz zadanie, ustaw czas i zaproś uczestników.</p>
            </li>
            <li className="workflow-card workflow-code">
              <span className="step-number" aria-hidden="true">
                02
              </span>
              <Icon name="code" />
              <h3>Koduj w przeglądarce</h3>
              <p>Pisz i uruchamiaj kod w wybranym języku bez instalacji.</p>
            </li>
            <li className="workflow-card workflow-tests">
              <span className="step-number" aria-hidden="true">
                03
              </span>
              <Icon name="file" />
              <h3>Automatyczne testy</h3>
              <p>
                Twoje rozwiązanie jest natychmiast sprawdzane na wielu testach.
              </p>
            </li>
            <li className="workflow-card workflow-results">
              <span className="step-number" aria-hidden="true">
                04
              </span>
              <Icon name="chart" />
              <h3>Zobacz wyniki</h3>
              <p>Porównaj czas, poprawność i jakość kodu w rankingu lobby.</p>
            </li>
          </ol>
        </div>
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
      </section>
    </>
  );
}
