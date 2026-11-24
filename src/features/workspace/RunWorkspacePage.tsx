import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Icon } from '../../shared/components/Icon';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { ApiError } from '../../shared/api/http';
import { useSession } from '../auth/session';
import type { Workspace } from '../lobby/lobbyApi';
import { useLobbyAction, useLobbyResource } from '../lobby/useLobbyRequest';
import { TaskWorkspace } from './TaskWorkspace';
import { RunResults } from './RunResults';
import type { RunOutcome, RunResult, RunSnapshot } from './runTypes';
import { readDrafts, writeDrafts } from './workspaceDrafts';

type Run = { outcome: RunOutcome; snapshot: RunSnapshot };
type Exit = { to: string; label: string; confirm?: boolean };
type Execute = (
  snapshot: RunSnapshot,
  signal: AbortSignal,
) => Promise<RunResult>;
type Submit = (snapshot: RunSnapshot, signal: AbortSignal) => Promise<unknown>;

export function RunWorkspacePage({
  scope,
  load,
  execute,
  submit,
  exit,
}: {
  scope: readonly (string | number)[];
  load: (signal: AbortSignal) => Promise<Workspace>;
  execute: Execute;
  submit?: Submit;
  exit: Exit;
}) {
  const session = useSession();
  const { data, error, errorCode, refresh } = useLobbyResource(load);
  const draftKey =
    data && session.status === 'authenticated'
      ? `codelobby.workspace.${JSON.stringify([session.user.id, ...scope, data.taskVersionId])}`
      : undefined;

  if (errorCode === 'TASK_ALREADY_SUBMITTED') {
    return (
      <section className="workspace-page">
        <h1>Wysłane</h1>
        <p>Rozwiązanie zostało oddane.</p>
        <Link className="workspace-back" to={exit.to}>
          <Icon name="arrowLeft" /> Wróć do lobby
        </Link>
      </section>
    );
  }

  return (
    <section className="workspace-page">
      {error && (
        <>
          <Alert title={error} variant="error" announce />
          <Link className="workspace-back" to={exit.to}>
            <Icon name="arrowLeft" />{' '}
            {exit.confirm ? 'Wróć do lobby' : exit.label}
          </Link>
          <Button variant="secondary" onClick={refresh}>
            Załaduj ponownie
          </Button>
        </>
      )}
      {data ? (
        <WorkspaceEditor
          key={draftKey ?? data.taskVersionId}
          data={data}
          draftKey={draftKey}
          execute={execute}
          submit={data.canSubmit ? submit : undefined}
          exit={exit}
        />
      ) : (
        !error && <LoadingIndicator label="Ładowanie zadania…" />
      )}
    </section>
  );
}

function WorkspaceEditor({
  data,
  draftKey,
  execute,
  submit,
  exit,
}: {
  data: Workspace;
  draftKey?: string;
  execute: Execute;
  submit?: Submit;
  exit: Exit;
}) {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState(() => readDrafts(draftKey, data.files));
  const [editorFiles] = useState(() =>
    data.files.map((file) => ({
      ...file,
      content: drafts[file.path] ?? file.content,
    })),
  );
  const [lastRun, setLastRun] = useState<Run>();
  const action = useLobbyAction();
  const submission = useLobbyAction();
  const filesByPath = new Map(data.files.map((file) => [file.path, file]));
  const updateDraft = useCallback(
    (path: string, content: string) => {
      const original = data.files.find((file) => file.path === path)?.content;
      setDrafts((current) => {
        if (content !== original) return { ...current, [path]: content };
        const next = { ...current };
        delete next[path];
        return next;
      });
    },
    [data.files],
  );

  useEffect(() => {
    writeDrafts(draftKey, drafts);
  }, [draftKey, drafts]);

  function capture(): RunSnapshot {
    return {
      taskVersionId: data.taskVersionId,
      files: data.files
        .filter((file) => file.role === 'EDITABLE')
        .map(({ path, content }) => ({
          path,
          content: drafts[path] ?? content,
        })),
    };
  }

  function returnAfterSubmission() {
    writeDrafts(draftKey, {});
    navigate(exit.to, { replace: true });
  }

  async function run() {
    const snapshot = capture();
    setLastRun(undefined);
    const result = await action.submit(async (signal) => {
      try {
        return await execute(snapshot, signal);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.code === 'TASK_ALREADY_SUBMITTED'
        ) {
          return 'submitted';
        }
        throw error;
      }
    });
    if (result === 'submitted') {
      returnAfterSubmission();
      return;
    }
    if (result) setLastRun({ outcome: { kind: 'result', result }, snapshot });
  }

  async function submitSolution() {
    if (!submit) return;
    const snapshot = capture();
    const saved = await submission.submit(async (signal) => {
      try {
        await submit(snapshot, signal);
      } catch (error) {
        // A lost response or another tab may have completed the only submission.
        if (
          !(error instanceof ApiError) ||
          error.code !== 'TASK_ALREADY_SUBMITTED'
        ) {
          throw error;
        }
      }
      return true;
    });
    if (saved) returnAfterSubmission();
  }

  const stale =
    lastRun?.snapshot.files.some(({ path, content }) => {
      const current = drafts[path] ?? filesByPath.get(path)?.content;
      return current !== content;
    }) ?? false;

  return (
    <TaskWorkspace
      title={data.title}
      description={data.description}
      tests={data.tests.map((test) => (
        <li key={test.id}>
          {test.title}
          {test.input !== undefined && test.expectedOutput !== undefined && (
            <>
              <br />
              <code>
                {test.input} → {test.expectedOutput}
              </code>
            </>
          )}
        </li>
      ))}
      files={editorFiles}
      onEdit={updateDraft}
      exit={exit}
      running={action.pending}
      runningLabel="Uruchamianie testów…"
      onRun={() => void run()}
      submission={
        submit
          ? {
              pending: submission.pending,
              error: submission.error,
              confirm: () => void submitSolution(),
            }
          : undefined
      }
      results={
        <>
          {action.error && (
            <Alert title={action.error} variant="error" announce />
          )}
          {action.pending && <p role="status">Uruchamianie testów…</p>}
          {lastRun && (
            <RunResults
              outcome={lastRun.outcome}
              tests={data.tests}
              stale={stale}
            />
          )}
          {!action.pending && !action.error && !lastRun && (
            <p className="workspace-note">
              Kliknij Run, aby uruchomić testy publiczne.
            </p>
          )}
        </>
      }
    />
  );
}
