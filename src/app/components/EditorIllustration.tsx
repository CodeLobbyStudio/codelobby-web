import { useRef } from 'react';
import { Icon } from '../../shared/components/Icon';
import { ProblemPreview } from './ProblemPreview';
import {
  demoSource as source,
  demoTestDurations as testDurations,
  demoRanking as ranking,
} from './lobbyDemo';
const inactiveControlHint = 'Dostępne w aktywnym lobby.';
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

function EditorFrame({ expanded = false }: { expanded?: boolean }) {
  const PreviewControl = expanded ? 'button' : 'span';
  const controlProps = expanded
    ? { type: 'button' as const, disabled: true, title: inactiveControlHint }
    : {};
  return (
    <div
      className={
        expanded ? 'editor-window' : 'editor-window editor-window--preview'
      }
      aria-hidden={expanded ? undefined : true}
    >
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
              const label = (
                <>
                  {task === 1 && <Icon name="arrowLeft" />}
                  <span>Zadanie {task}</span>
                  {task === 3 && <Icon name="arrowRight" />}
                </>
              );
              return expanded ? (
                <button
                  key={task}
                  className="preview-next-task"
                  type="button"
                  disabled
                  title={inactiveControlHint}
                >
                  {label}
                </button>
              ) : (
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
        <ProblemPreview interactive={expanded} />
        <div className="coding-pane">
          <div className="editor-toolbar">
            <span className="language-name">
              🐍 Python 3.11 <Icon name="chevron" />
            </span>
            <PreviewControl className="preview-run" {...controlProps}>
              <Icon name="play" /> Uruchom
            </PreviewControl>
            <PreviewControl className="preview-send" {...controlProps}>
              <Icon name="send" /> Wyślij
            </PreviewControl>
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
              <PreviewControl className="preview-console" {...controlProps}>
                Konsola
              </PreviewControl>
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
          {expanded && (
            <div
              className="participant-legend"
              aria-label="Statusy uczestników"
            >
              {Object.values(participantStates).map(({ label, color }) => (
                <span key={label}>
                  <i
                    className="person-dot"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                  {label}
                </span>
              ))}
            </div>
          )}
          <ul
            className="preview-people"
            tabIndex={expanded ? 0 : undefined}
            aria-label="Lista uczestników lobby"
          >
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
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLDivElement>(null);
  const description =
    'Ilustracja planowanego lobby CodeLobby: opis zadania, edytor Python, testy, uczestnicy i ranking. To statyczny podgląd, nie aktywna sesja.';
  return (
    <div className="editor-illustration">
      <div
        className="preview-trigger"
        role="button"
        tabIndex={0}
        ref={trigger}
        aria-label="Powiększ podgląd lobby"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            dialog.current?.showModal();
          }
        }}
      >
        <figure role="img" aria-label={description} style={{ margin: 0 }}>
          <EditorFrame />
        </figure>
        <span className="preview-hint" aria-hidden="true">
          <Icon name="zoom" /> Powiększ podgląd
        </span>
      </div>
      <dialog
        className="preview-dialog"
        ref={dialog}
        aria-labelledby="preview-title"
        onClose={() => trigger.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const rect = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < rect.left ||
              event.clientX > rect.right ||
              event.clientY < rect.top ||
              event.clientY > rect.bottom
            )
              event.currentTarget.close();
          }
        }}
      >
        <header className="preview-dialog-header">
          <h2 id="preview-title">
            Podgląd lobby <span className="preview-badge">Ilustracja</span>
          </h2>
          <button
            className="preview-close"
            type="button"
            aria-label="Zamknij podgląd"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </header>
        <div
          className="preview-dialog-scroll"
          tabIndex={0}
          role="region"
          aria-label="Podgląd lobby"
        >
          <EditorFrame expanded />
        </div>
      </dialog>
    </div>
  );
}
