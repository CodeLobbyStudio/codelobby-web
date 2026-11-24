import { useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Icon } from '../../shared/components/Icon';
import { JavaEditor } from './JavaEditor';
import { WorkspaceFiles } from './WorkspaceFiles';
import { WorkspacePanels } from './WorkspacePanels';
import './workspace.css';

type File = {
  path: string;
  role: 'EDITABLE' | 'READ_ONLY';
  content: string;
};

type Props = {
  title: string;
  description: string;
  tests: ReactNode;
  files: readonly File[];
  onEdit: (path: string, content: string) => void;
  exit: { to: string; label: string; confirm?: boolean };
  runningLabel: string;
  running: boolean;
  onRun: () => void;
  submission?: { pending: boolean; error: string; confirm: () => void };
  results: ReactNode;
};

export function TaskWorkspace({
  title,
  description,
  tests,
  files,
  onEdit,
  exit,
  runningLabel,
  running,
  onRun,
  submission,
  results,
}: Props) {
  const instanceId = useId();
  const exitDialog = useRef<HTMLDialogElement>(null);
  const submitDialog = useRef<HTMLDialogElement>(null);
  const [tabs, setTabs] = useState<{ paths: string[]; selected?: string }>(
    () => {
      const first = files.find((file) => file.role === 'EDITABLE') ?? files[0];
      return first
        ? { paths: [first.path], selected: first.path }
        : { paths: [] };
    },
  );
  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const openFiles = tabs.paths
    .map((path) => filesByPath.get(path))
    .filter((file) => file !== undefined);
  const selected = openFiles.find((file) => file.path === tabs.selected);
  const editorPanelId = `${instanceId}-editor`;
  const tabId = (path: string) => `${instanceId}-${encodeURIComponent(path)}`;

  function openFile(path: string) {
    setTabs(({ paths }) => ({
      paths: paths.includes(path) ? paths : [...paths, path],
      selected: path,
    }));
  }

  function closeFile(path: string) {
    const index = tabs.paths.indexOf(path);
    const paths = tabs.paths.filter((openPath) => openPath !== path);
    const selected =
      tabs.selected === path
        ? (paths[index] ?? paths[index - 1])
        : tabs.selected;
    setTabs({ paths, selected });
    if (selected) document.getElementById(tabId(selected))?.focus();
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = tabs.paths.length - 1;
    const adjacent: Record<string, number> = {
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowRight: index === last ? 0 : index + 1,
      Home: 0,
      End: last,
    };
    if (event.key === 'Delete') {
      event.preventDefault();
      closeFile(tabs.paths[index]);
    } else if (Object.hasOwn(adjacent, event.key)) {
      event.preventDefault();
      const path = tabs.paths[adjacent[event.key]];
      openFile(path);
      document.getElementById(tabId(path))?.focus();
    }
  }

  return (
    <div
      className="workspace-ide"
      onKeyDownCapture={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault();
          event.stopPropagation();
          if (
            !running &&
            !event.repeat &&
            !exitDialog.current?.open &&
            !submitDialog.current?.open &&
            !submission?.pending
          )
            onRun();
        }
      }}
    >
      <header className="workspace-toolbar">
        <div>
          <span className="workspace-brand">
            <Icon name="code" /> CodeLobby
          </span>
          <h1>{title}</h1>
        </div>
        <div className="workspace-actions">
          {exit.confirm ? (
            <Button
              variant="secondary"
              onClick={() => exitDialog.current?.showModal()}
            >
              {exit.label}
            </Button>
          ) : (
            <Link className="codelobby-button button--secondary" to={exit.to}>
              {exit.label}
            </Link>
          )}
          <Button
            variant={submission ? 'secondary' : 'primary'}
            onClick={onRun}
            loading={running}
            disabled={submission?.pending}
            loadingLabel={runningLabel}
            aria-keyshortcuts="Control+Enter Meta+Enter"
          >
            <Icon name="play" /> Run
          </Button>
          {submission && (
            <Button
              aria-haspopup="dialog"
              disabled={running || submission.pending}
              onClick={() => submitDialog.current?.showModal()}
            >
              <Icon name="send" /> Oddaj rozwiązanie
            </Button>
          )}
        </div>
      </header>
      {exit.confirm && (
        <dialog
          ref={exitDialog}
          className="workspace-exit-dialog"
          aria-labelledby={`${instanceId}-exit`}
        >
          <h2 id={`${instanceId}-exit`}>Wrócić do lobby?</h2>
          <div className="workspace-actions">
            <form method="dialog">
              <Button type="submit" variant="secondary">
                Zostań w edytorze
              </Button>
            </form>
            <Link className="codelobby-button button--primary" to={exit.to}>
              Wróć do lobby
            </Link>
          </div>
        </dialog>
      )}
      {submission && (
        <dialog
          ref={submitDialog}
          className="workspace-exit-dialog workspace-submit-dialog"
          aria-labelledby={`${instanceId}-submit`}
          aria-describedby={`${instanceId}-submit-description`}
          onCancel={(event) => {
            if (submission.pending) event.preventDefault();
          }}
        >
          <h2 id={`${instanceId}-submit`}>Oddać rozwiązanie?</h2>
          <p id={`${instanceId}-submit-description`}>
            Możesz oddać to zadanie tylko raz. Po wysłaniu kod będzie dostępny
            dla prowadzącego, a zadanie zostanie zablokowane.
          </p>
          {submission.error && (
            <Alert title={submission.error} variant="error" announce />
          )}
          <div className="workspace-actions">
            <Button
              variant="secondary"
              disabled={submission.pending}
              onClick={() => submitDialog.current?.close()}
            >
              Wróć do edytora
            </Button>
            <Button
              onClick={submission.confirm}
              loading={submission.pending}
              loadingLabel="Wysyłanie…"
            >
              Wyślij rozwiązanie
            </Button>
          </div>
        </dialog>
      )}
      <WorkspacePanels
        brief={
          <details className="workspace-brief" id="workspace-brief-panel" open>
            <summary>Opis zadania</summary>
            <div className="workspace-brief-body">
              <p className="workspace-description">{description}</p>
              <h3>Testy publiczne</h3>
              <ul>{tests}</ul>
            </div>
          </details>
        }
        project={
          <WorkspaceFiles
            id="workspace-project-panel"
            files={files.map(({ path, role }) => ({ id: path, path, role }))}
            selected={tabs.selected}
            open={openFile}
          />
        }
        editor={
          <section className="workspace-editing" aria-label="Edytor zadania">
            <div
              className="workspace-tabs"
              role="tablist"
              aria-label="Otwarte pliki"
            >
              {openFiles.map((file, index) => (
                <div
                  className="workspace-tab"
                  key={file.path}
                  role="presentation"
                  data-active={file.path === tabs.selected}
                >
                  <button
                    type="button"
                    role="tab"
                    id={tabId(file.path)}
                    aria-controls={editorPanelId}
                    aria-selected={file.path === tabs.selected}
                    tabIndex={file.path === tabs.selected ? 0 : -1}
                    title={file.path}
                    onClick={() => openFile(file.path)}
                    onKeyDown={(event) => onTabKey(event, index)}
                  >
                    <Icon name={file.role === 'READ_ONLY' ? 'lock' : 'code'} />
                    {file.path.split('/').at(-1)}
                  </button>
                  <button
                    type="button"
                    className="workspace-tab-close"
                    aria-label={`Zamknij ${file.path}`}
                    onClick={() => closeFile(file.path)}
                  >
                    <Icon name="close" />
                  </button>
                </div>
              ))}
            </div>
            {selected ? (
              <div className="workspace-path">
                <span title={selected.path}>
                  {selected.path.split('/').join(' / ')}
                </span>
                <span>
                  {selected.role === 'READ_ONLY' ? 'Tylko do odczytu' : 'Java'}
                </span>
              </div>
            ) : (
              <p className="workspace-no-file">
                Wybierz plik w drzewie projektu.
              </p>
            )}
            <div
              role="tabpanel"
              id={editorPanelId}
              aria-labelledby={selected ? tabId(selected.path) : undefined}
              hidden={!selected}
            >
              <JavaEditor file={selected} files={files} onChange={onEdit} />
            </div>
            {selected?.role === 'EDITABLE' && (
              <div className="workspace-shortcuts">
                <span>
                  Podpowiedzi <kbd>Ctrl+Spacja</kbd>
                </span>
                <span>
                  Problemy składni <kbd>F8</kbd>
                </span>
                <span title="Popraw wcięcia i odstępy w całym pliku">
                  Formatuj kod <kbd>Shift+Alt+F</kbd>
                </span>
                <span>
                  Run <kbd>Ctrl+Enter</kbd>
                </span>
                <span>
                  Przenieś fokus klawiszem Tab <kbd>Ctrl+M</kbd>
                </span>
              </div>
            )}
          </section>
        }
        results={
          <section
            className="workspace-output"
            id="workspace-results-panel"
            aria-label="Wyniki testów"
          >
            <h2>Wyniki testów</h2>
            <div className="workspace-results">{results}</div>
          </section>
        }
      />
    </div>
  );
}
