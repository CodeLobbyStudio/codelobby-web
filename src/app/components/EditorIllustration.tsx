import { Icon } from '../../shared/components/Icon';
import { ProblemPreview } from './ProblemPreview';

const source = [
  'def najdluzszy_podciag(arr):',
  '    if not arr:',
  '        return 0',
  '',
  '    best = 1',
  '    current = 1',
  '',
  '    for i in range(1, len(arr)):',
  '        if arr[i] > arr[i - 1]:',
  '            current += 1',
  '        else:',
  '            best = max(best, current)',
  '            current = 1',
  '',
  '    return max(best, current)',
];
const testDurations = [0, 8, 16, 94];
const people = [
  'Ty',
  'Kaczan',
  'PawełBM',
  'Oliwka',
  'Simon',
  'Zuzu',
  'Mek',
  'Ada',
  'Bartek',
  'Celina',
  'Dawid',
  'Ewa',
  'Filip',
  'Gosia',
  'Hubert',
  'Iga',
  'Jan',
  'Kasia',
  'Leon',
];
const participantStates = {
  submitted: { label: 'Wysłano', color: '#35da86' },
  working: { label: 'W trakcie', color: '#ffa343' },
  idle: { label: 'Nie rozpoczęto', color: '#94a3b0' },
};
const ranking = [
  ['PawełBM', '100', '52 ms'],
  ['Kaczan', '100', '67 ms'],
  ['Ty', '100', `${testDurations.reduce((sum, time) => sum + time, 0)} ms`],
  ['Oliwka', '100', '181 ms'],
  ['Simon', '75', '60 ms'],
];

function highlight(line: string) {
  return line
    .split(
      /(\b(?:def|if|not|return|for|in|else|range|len|max)\b|\b\d+\b|najdluzszy_podciag)/g,
    )
    .map((token, i) => {
      const className = /^\d+$/.test(token)
        ? 'syntax-number'
        : token === 'najdluzszy_podciag'
          ? 'syntax-function'
          : /^(def|if|not|return|for|in|else|range|len|max)$/.test(token)
            ? 'syntax-keyword'
            : '';
      return (
        <span key={i} className={className}>
          {token}
        </span>
      );
    });
}

function EditorFrame() {
  return (
    <div className="editor-window editor-window--preview" aria-hidden="true">
      <div className="editor-top">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span className="preview-brand">
          Code<span>Lobby</span>
        </span>
        <div className="editor-task-navigation">
          <span className="editor-breadcrumb">
            Lobby › Algorytmy › <b>Zadanie 2</b>
          </span>
          <div className="preview-task-buttons">
            {[1, 3].map((task) => {
              const label = task === 1 ? '← Zadanie 1' : 'Zadanie 3 →';
              return (
                <span key={task} className="preview-next-task">
                  {label}
                </span>
              );
            })}
          </div>
        </div>
        <span className="editor-timer">
          <Icon name="clock" />
          00:42:17
        </span>
      </div>
      <div className="editor-columns">
        <ProblemPreview />
        <div className="coding-pane">
          <div className="editor-toolbar">
            <span className="language-name">
              🐍 Python 3.11 <Icon name="chevron" />
            </span>
            <span className="preview-run">
              <Icon name="play" /> Uruchom
            </span>
            <span className="preview-send">
              <Icon name="send" /> Wyślij
            </span>
          </div>
          <div className="preview-code">
            {source.map((line, i) => (
              <div className="code-row" key={i}>
                <span className="line-number">{i + 1}</span>
                <code>{highlight(line) || ' '}</code>
              </div>
            ))}
          </div>
          <div className="test-results">
            <div className="preview-tabs">
              <span className="selected">Wyniki</span>
              <span className="preview-console">Konsola</span>
            </div>
            {testDurations.map((time, i) => (
              <div className="test-result" key={time}>
                <span>
                  Test {i + 1}
                  {i === 3 ? ' (ukryty)' : ''}
                </span>
                <span className="test-pass">
                  <Icon name="checkCircle" className="test-check" />
                  Zaliczony
                </span>
                <span>{time} ms</span>
              </div>
            ))}
          </div>
        </div>
        <div className="session-pane">
          <div className="pane-label">Uczestnicy ({people.length}/20)</div>
          <ul className="preview-people" aria-label="Lista uczestników lobby">
            {people.map((name, index) => {
              const status = ranking.some(([rankedName]) => rankedName === name)
                ? participantStates.submitted
                : index >= people.length - 3
                  ? participantStates.idle
                  : participantStates.working;
              return (
                <li
                  key={name}
                  className={name === 'Ty' ? 'is-you' : undefined}
                  title={status.label}
                  aria-label={name + ' — ' + status.label}
                >
                  <span
                    className="person-dot"
                    style={{ backgroundColor: status.color }}
                    aria-hidden="true"
                  />
                  <span className="participant-name">{name}</span>
                </li>
              );
            })}
          </ul>
          <div className="session-ranking">
            <div className="pane-label">Ranking</div>
            <table className="preview-ranking">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Użytkownik</th>
                  <th>Wynik</th>
                  <th>Czas</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map(([name, score, time], i) => (
                  <tr key={name} className={name === 'Ty' ? 'is-you' : ''}>
                    <td>{i + 1}</td>
                    <td>{name}</td>
                    <td>{score}</td>
                    <td>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorIllustration() {
  return (
    <div className="editor-illustration">
      <figure
        role="img"
        aria-label="Ilustracja planowanego lobby CodeLobby: opis zadania, edytor Python, testy, uczestnicy i ranking. Statyczny podgląd."
        style={{ margin: 0 }}
      >
        <EditorFrame />
      </figure>
    </div>
  );
}
