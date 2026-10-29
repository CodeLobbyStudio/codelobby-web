import { Icon } from '../../shared/components/Icon';
import { demoCases } from './lobbyDemo';
import './WorkflowJourney.css';

export function WorkflowJourney() {
  return (
    <div className="journey content-width">
      <div className="journey-heading">
        <p className="eyebrow">Jak to działa</p>
        <h2 id="how-title">
          Od lobby do wyników
          <br />w kilku krokach
        </h2>
      </div>
      <ol className="journey-grid" aria-label="Etapy pracy w CodeLobby">
        <li className="journey-step journey-step--lobby">
          <span className="journey-number" aria-hidden="true">
            01
          </span>
          <Icon name="users" />
          <h3>Utwórz lobby</h3>
          <p>Wybierz zadanie, ustaw czas i zaproś uczestników.</p>
          <div className="journey-code-chip journey-visual">
            <span>Kod dołączenia</span>
            <code>7XQ-4F2</code>
          </div>
        </li>
        <li className="journey-step journey-step--code">
          <span className="journey-number" aria-hidden="true">
            02
          </span>
          <Icon name="code" />
          <h3>Koduj w przeglądarce</h3>
          <p>Pisz i uruchamiaj kod w wybranym języku bez instalacji.</p>
          <div className="journey-code-example journey-visual">
            <span>Python 3.11</span>
            <pre>
              <code>
                {
                  'best = cur = 1\nfor a, b in zip(arr, arr[1:]):\n    cur = cur + 1 if b > a else 1\n    best = max(best, cur)'
                }
              </code>
            </pre>
          </div>
        </li>
        <li className="journey-step journey-step--tests">
          <span className="journey-number" aria-hidden="true">
            03
          </span>
          <Icon name="file" />
          <h3>Automatyczne testy</h3>
          <p>Twoje rozwiązanie jest natychmiast sprawdzane na wielu testach.</p>
          <div className="journey-test-example journey-visual">
            <div className="journey-test-heading">
              <span>Tablica</span>
              <span>Długość</span>
            </div>
            {demoCases.map(({ input, output }) => (
              <div className="journey-test-row" key={input}>
                <code>{input.replaceAll(', ', ',')}</code>
                <span className="journey-case-result">
                  <Icon name="checkCircle" />
                  <b>{output}</b>
                </span>
              </div>
            ))}
            <span className="journey-test-summary">
              <Icon name="checkCircle" /> Wszystkie próby zaliczone
            </span>
          </div>
        </li>
        <li className="journey-step journey-step--results">
          <span className="journey-number" aria-hidden="true">
            04
          </span>
          <Icon name="chart" />
          <h3>Zobacz wyniki</h3>
          <p>Porównaj czas, poprawność i jakość kodu w rankingu lobby.</p>
          <span className="journey-finish-label">
            Sięgnij po pierwsze miejsce
          </span>
          <div
            className="journey-podium journey-visual"
            role="img"
            aria-label="Przykładowy finał: Ty na pierwszym miejscu"
          >
            <span className="podium-second">
              <b>2</b>
            </span>
            <span className="podium-first">
              <Icon name="trophy" />
              <b>1</b>
              <small>Ty</small>
            </span>
            <span className="podium-third">
              <b>3</b>
            </span>
          </div>
        </li>
      </ol>
      <p className="journey-closing">
        Od wspólnego zadania <span>do wspólnych wyników.</span>
      </p>
    </div>
  );
}
