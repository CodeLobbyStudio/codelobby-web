import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/Button';
import { demoTask, scenarios, type Scenario } from './demoTask';
import { JavaEditor } from './JavaEditor';
import { simulateRun } from './demoRun';
import { RunResults } from './RunResults';
import type { RunOutcome, RunSnapshot } from './runTypes';
import './workspace.css';

const initialFile = demoTask.files[0];

export default function WorkspacePreview({
  run = simulateRun,
}: {
  run?: (snapshot: RunSnapshot, scenario: Scenario) => RunOutcome;
} = {}) {
  const [activePath, setActivePath] = useState<string>(initialFile.path);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [scenario, setScenario] = useState<Scenario>('accepted');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    snapshot: RunSnapshot;
    outcome: RunOutcome;
  } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeFile =
    demoTask.files.find((file) => file.path === activePath) ?? initialFile;

  const edit = useCallback((path: string, content: string) => {
    setDrafts((previous) => ({ ...previous, [path]: content }));
  }, []);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  function runDemo() {
    if (timer.current !== null) return;
    const snapshot: RunSnapshot = {
      taskVersionId: demoTask.versionId,
      files: demoTask.files
        .filter((file) => file.role === 'EDITABLE')
        .map((file) => ({
          path: file.path,
          content: drafts[file.path] ?? file.content,
        })),
    };
    setPending(true);
    setResult(null);
    timer.current = setTimeout(() => {
      timer.current = null;
      setResult({ snapshot, outcome: run(snapshot, scenario) });
      setPending(false);
    }, 450);
  }

  const stale =
    result !== null &&
    (result.snapshot.taskVersionId !== demoTask.versionId ||
      demoTask.files.some(
        (file) =>
          file.role === 'EDITABLE' &&
          (drafts[file.path] ?? file.content) !==
            result.snapshot.files.find(
              (snapshotFile) => snapshotFile.path === file.path,
            )?.content,
      ));

  return (
    <section className="content-width workspace">
      <Link to="/">Strona główna</Link>
      <header className="workspace-header">
        <h1>{demoTask.title}</h1>
        <span>Java 21</span>
      </header>
      <p className="workspace-note">
        Podgląd deweloperski. Wyniki są symulowane. Zmiany plików pozostają w
        tym widoku.
      </p>
      <div className="workspace-grid">
        <section className="workspace-task" aria-labelledby="workspace-task">
          <h2 id="workspace-task">Treść zadania</h2>
          <p>{demoTask.description}</p>
          <h3>Publiczne przypadki testowe</h3>
          <ul>
            {demoTask.tests.map((test) => (
              <li key={test.id}>
                {test.title}
                <br />
                <code>
                  {test.input} → {test.expected}
                </code>
              </li>
            ))}
          </ul>
        </section>
        <section className="workspace-code" aria-label="Edytor kodu">
          <div
            className="workspace-files"
            role="group"
            aria-label="Pliki zadania"
          >
            {demoTask.files.map((file) => (
              <button
                key={file.path}
                type="button"
                aria-pressed={activeFile.path === file.path}
                onClick={() => setActivePath(file.path)}
              >
                <span translate="no">{file.path.split('/').at(-1)}</span>
                {file.role === 'READ_ONLY' && <small>Tylko odczyt</small>}
              </button>
            ))}
          </div>
          <JavaEditor
            key={activeFile.path}
            file={activeFile}
            content={drafts[activeFile.path] ?? activeFile.content}
            onChange={edit}
          />
          <div className="workspace-run">
            <label>
              Scenariusz demonstracyjny
              <select
                value={scenario}
                disabled={pending}
                onChange={(event) =>
                  setScenario(event.target.value as Scenario)
                }
              >
                {Object.entries(scenarios).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Button
              onClick={runDemo}
              loading={pending}
              loadingLabel="Symulacja w toku…"
            >
              Symuluj Run
            </Button>
          </div>
          <section
            className="workspace-results"
            aria-labelledby="workspace-results"
          >
            <h2 id="workspace-results">Wyniki testów</h2>
            {pending && <p role="status">Oczekiwanie na przykładowy wynik…</p>}
            {!pending && !result && (
              <p>
                Wybierz scenariusz i uruchom symulację, żeby zobaczyć
                przykładowy wynik.
              </p>
            )}
            {result && (
              <RunResults
                outcome={result.outcome}
                tests={demoTask.tests}
                stale={stale}
              />
            )}
          </section>
        </section>
      </div>
    </section>
  );
}
