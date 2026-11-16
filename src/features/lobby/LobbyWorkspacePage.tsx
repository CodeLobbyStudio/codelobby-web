import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { JavaEditor } from '../workspace/JavaEditor';
import { RunResults } from '../workspace/RunResults';
import type { RunOutcome, RunSnapshot } from '../workspace/runTypes';
import { lobbyApi, positiveId } from './lobbyApi';
import type { Workspace } from './lobbyApi';
import { useLobbyAction, useLobbyResource } from './useLobbyRequest';
import '../workspace/workspace.css';
import './lobby.css';

type WorkspaceIds = { lobbyId: number; taskId: number };
type Run = { outcome: RunOutcome; snapshot: RunSnapshot };

export default function LobbyWorkspacePage() {
  const params = useParams();
  const lobbyId = positiveId(params.lobbyId);
  const taskId = positiveId(params.taskId);
  if (lobbyId === null || taskId === null) {
    return <Alert title="Nieprawidłowy adres zadania." announce />;
  }
  return (
    <LobbyWorkspace
      key={`${lobbyId}/${taskId}`}
      lobbyId={lobbyId}
      taskId={taskId}
    />
  );
}

function LobbyWorkspace({ lobbyId, taskId }: WorkspaceIds) {
  const read = useCallback(
    (signal: AbortSignal) => lobbyApi.workspace(lobbyId, taskId, signal),
    [lobbyId, taskId],
  );
  const { data, error, refresh } = useLobbyResource(read);

  return (
    <section className="lobby-page">
      <Link to={'/lobbies/' + lobbyId}>Wróć do lobby</Link>
      {error && (
        <>
          <Alert title={error} variant="error" announce />
          <Button variant="secondary" onClick={refresh}>
            Załaduj ponownie
          </Button>
        </>
      )}
      {data ? (
        <WorkspaceEditor
          key={data.taskVersionId}
          data={data}
          lobbyId={lobbyId}
          taskId={taskId}
        />
      ) : (
        !error && <LoadingIndicator label="Ładowanie zadania…" />
      )}
    </section>
  );
}

function WorkspaceEditor({
  data,
  lobbyId,
  taskId,
}: WorkspaceIds & { data: Workspace }) {
  const [selectedPath, setSelectedPath] = useState(
    () => data.files.find((file) => file.role === 'EDITABLE')?.path,
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [lastRun, setLastRun] = useState<Run>();
  const action = useLobbyAction();
  const selected = data.files.find((file) => file.path === selectedPath);
  const updateDraft = useCallback((path: string, content: string) => {
    setDrafts((current) => ({ ...current, [path]: content }));
  }, []);

  async function run() {
    const snapshot: RunSnapshot = {
      taskVersionId: data.taskVersionId,
      files: data.files
        .filter((file) => file.role === 'EDITABLE')
        .map(({ path, content }) => ({
          path,
          content: drafts[path] ?? content,
        })),
    };
    setLastRun(undefined);
    const result = await action.submit((signal) =>
      lobbyApi.run(lobbyId, taskId, snapshot, signal),
    );
    if (result) setLastRun({ outcome: { kind: 'result', result }, snapshot });
  }

  const stale =
    lastRun?.snapshot.files.some(({ path, content }) => {
      const current = drafts[path] ?? data.files.find((f) => f.path === path)?.content;
      return current !== content;
    }) ?? false;

  return (
    <>
      <header className="workspace-header">
        <h1>{data.title}</h1>
        <span>Java</span>
      </header>
      <div className="workspace-grid">
        <section className="workspace-task">
          <h2>Opis zadania</h2>
          <p className="lobby-description">{data.description}</p>
          <h3>Testy publiczne</h3>
          <ul>
            {data.tests.map((test) => (
              <li key={test.id}>{test.title}</li>
            ))}
          </ul>
        </section>
        <section className="workspace-code" aria-label="Edytor zadania">
          <div className="workspace-files" aria-label="Pliki zadania">
            {data.files.map((file) => (
              <button
                key={file.path}
                type="button"
                aria-pressed={selectedPath === file.path}
                onClick={() => setSelectedPath(file.path)}
              >
                {file.path}
                {file.role === 'READ_ONLY' && <small>Tylko do odczytu</small>}
              </button>
            ))}
          </div>
          {selected && (
            <JavaEditor
              key={selected.path}
              file={selected}
              content={drafts[selected.path] ?? selected.content}
              onChange={updateDraft}
            />
          )}
          <div className="lobby-run">
            <Button
              onClick={() => void run()}
              loading={action.pending}
              loadingLabel="Uruchamianie testów…"
            >
              Run
            </Button>
            {action.error && (
              <Alert title={action.error} variant="error" announce />
            )}
            {lastRun && (
              <RunResults outcome={lastRun.outcome} tests={data.tests} stale={stale} />
            )}
          </div>
        </section>
      </div>
    </>
  );
}
