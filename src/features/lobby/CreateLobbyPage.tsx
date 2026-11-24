import { useCallback, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { FormField } from '../../shared/components/FormField';
import { Icon } from '../../shared/components/Icon';
import { JavaEditor } from '../workspace/JavaEditor';
import { isJavaSourcePath } from '../workspace/javaSourcePath';
import { javaExample } from './javaExample';
import { lobbyApi } from './lobbyApi';
import type { FileRole, TaskFile } from './lobbyApi';
import { useLobbyAction } from './useLobbyRequest';
import { WorkspaceFiles } from '../workspace/WorkspaceFiles';
import '../workspace/workspace.css';
import './lobby.css';

const initialJava = javaExample.languages[0];
const fileRoles: Record<FileRole, string> = {
  EDITABLE: 'Do edycji',
  READ_ONLY: 'Tylko do odczytu',
  VISIBLE_TEST: 'Źródło testów publicznych',
};

type FileRow = TaskFile & { key: number };
const maxSourceFiles = 50;
const maxSourceBytes = 128 * 1024;

export default function CreateLobbyPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState(javaExample.title);
  const [description, setDescription] = useState(javaExample.description);
  const [mainClass, setMainClass] = useState(
    initialJava.javaPublicTests.mainClass,
  );
  const [testIds, setTestIds] = useState(
    initialJava.javaPublicTests.testIds.join(', '),
  );
  const [files, setFiles] = useState<FileRow[]>(() =>
    initialJava.files.map((file, key) => ({ ...file, key })),
  );
  const [selectedFileKey, setSelectedFileKey] = useState<number | undefined>(0);
  const selectedFile = files.find(({ key }) => key === selectedFileKey);
  const nextFileKey = useRef(initialJava.files.length);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [importError, setImportError] = useState('');
  const [formError, setFormError] = useState('');
  const [taskId, setTaskId] = useState<number>();
  const [name, setName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('2');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const action = useLobbyAction();

  const editFile = useCallback((key: number, patch: Partial<TaskFile>) => {
    setFiles((current) =>
      current.map((file) => (file.key === key ? { ...file, ...patch } : file)),
    );
  }, []);

  const editSource = useCallback(
    (_: string, content: string) => {
      if (selectedFileKey !== undefined) editFile(selectedFileKey, { content });
    },
    [editFile, selectedFileKey],
  );

  function resetTask(withExample: boolean) {
    setTitle(withExample ? javaExample.title : '');
    setDescription(withExample ? javaExample.description : '');
    setMainClass(withExample ? initialJava.javaPublicTests.mainClass : '');
    setTestIds(
      withExample ? initialJava.javaPublicTests.testIds.join(', ') : '',
    );
    const newFiles = withExample
      ? initialJava.files.map((file) => ({
          ...file,
          key: nextFileKey.current++,
        }))
      : [];
    setFiles(newFiles);
    setSelectedFileKey(newFiles[0]?.key);
    setImportStatus('');
    setImportError('');
    setFormError('');
  }

  function addFile() {
    if (files.length >= maxSourceFiles) return;
    const key = nextFileKey.current++;
    setFiles((current) => [
      ...current,
      { key, path: '', type: 'EDITABLE', content: '' },
    ]);
    setSelectedFileKey(key);
  }

  function removeSelectedFile() {
    const index = files.findIndex(({ key }) => key === selectedFileKey);
    const remaining = files.filter(({ key }) => key !== selectedFileKey);
    setFiles(remaining);
    setSelectedFileKey((remaining[index] ?? remaining[index - 1])?.key);
  }

  async function importFiles(selected: File[]) {
    if (selected.length === 0 || importing || action.pending) return;
    setImporting(true);
    setImportStatus('');
    setImportError('');
    const nextFiles = [...files];
    const rejected: string[] = [];
    let testClass = mainClass.trim();
    let imported = 0;
    let fileToOpen: FileRow | undefined;
    try {
      for (const file of selected) {
        if (!isJavaSourcePath(file.name) || file.size > maxSourceBytes) {
          rejected.push(file.name);
          continue;
        }
        let content: string;
        try {
          content = new TextDecoder('utf-8', { fatal: true }).decode(
            await file.arrayBuffer(),
          );
        } catch {
          rejected.push(file.name);
          continue;
        }
        const packageName = content.match(/^\s*package\s+([\w$.]+)\s*;/m)?.[1];
        const className = file.name.slice(0, -'.java'.length);
        const qualifiedClass = packageName
          ? `${packageName}.${className}`
          : className;
        const isTest =
          qualifiedClass === testClass || /Tests?\.java$/.test(file.name);
        const directory = packageName
          ? `${packageName.replaceAll('.', '/')}/`
          : '';
        const path = `${isTest ? 'tests' : 'src'}/${directory}${file.name}`;
        const index = nextFiles.findIndex(
          (item) => item.path.trim().toLowerCase() === path.toLowerCase(),
        );
        if (
          !isJavaSourcePath(path) ||
          (index < 0 && nextFiles.length >= maxSourceFiles)
        ) {
          rejected.push(file.name);
          continue;
        }
        const importedFile: FileRow =
          index === -1
            ? {
                key: nextFileKey.current++,
                path,
                content,
                type: isTest ? 'VISIBLE_TEST' : 'EDITABLE',
              }
            : { ...nextFiles[index], path, content };
        if (index === -1) nextFiles.push(importedFile);
        else nextFiles[index] = importedFile;
        if (
          !fileToOpen ||
          (fileToOpen.type !== 'EDITABLE' && importedFile.type === 'EDITABLE')
        ) {
          fileToOpen = importedFile;
        }
        if (!testClass && isTest) testClass = qualifiedClass;
        imported++;
      }
      setFiles(nextFiles);
      setMainClass(testClass);
      if (fileToOpen) {
        setSelectedFileKey(fileToOpen.key);
        setImportStatus(`Import zakończony (${imported}).`);
      }
      if (rejected.length) {
        setImportError(
          `Nie udało się zaimportować ${rejected.join(', ')}. Możesz dodać do ${maxSourceFiles} plików .java w UTF-8, po 128 KiB każdy.`,
        );
      }
    } finally {
      setImporting(false);
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (importing) return;
    setFormError('');
    if (!name.trim()) {
      setFormError('Wpisz nazwę lobby.');
      return;
    }
    const publicTestIds = testIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (taskId === undefined) {
      if (!title.trim() || !description.trim()) {
        setFormError('Wpisz tytuł i opis zadania.');
        return;
      }
      const paths = files.map(({ path }) => path.trim());
      if (
        !files.some(({ type }) => type === 'EDITABLE') ||
        !files.some(({ type }) => type === 'VISIBLE_TEST')
      ) {
        setFormError(
          'Dodaj plik do edycji i źródło testów publicznych. Wybierz plik z listy, aby zmienić jego typ.',
        );
        return;
      }
      if (!/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(mainClass.trim())) {
        setFormError(
          'Podaj nazwę klasy z metodą main, np. PublicTests albo demo.PublicTests.',
        );
        return;
      }
      if (
        publicTestIds.length === 0 ||
        publicTestIds.length > 50 ||
        new Set(publicTestIds).size !== publicTestIds.length ||
        publicTestIds.some(
          (id) => !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(id),
        )
      ) {
        setFormError(
          'Podaj od 1 do 50 różnych identyfikatorów testów, np. public-1, public-2.',
        );
        return;
      }
      if (
        !paths.every(isJavaSourcePath) ||
        new Set(paths.map((path) => path.toLowerCase())).size !== paths.length
      ) {
        setFormError(
          'Każdy plik musi mieć inną, względną ścieżkę zakończoną na .java, np. src/Solution.java.',
        );
        return;
      }
    }
    const id = await action.submit(async (signal) => {
      const savedTaskId =
        taskId ??
        (await lobbyApi.createTask(
          {
            title: title.trim(),
            description: description.trim(),
            difficulty: 'EASY',
            languages: [
              {
                language: 'JAVA',
                files: files.map(({ path, type, content }) => ({
                  path: path.trim(),
                  type,
                  content,
                })),
                javaPublicTests: {
                  mainClass: mainClass.trim(),
                  testIds: publicTestIds,
                },
              },
            ],
          },
          signal,
        ));
      signal.throwIfAborted();
      setTaskId(savedTaskId);
      return lobbyApi.createLobby(
        {
          name: name.trim(),
          maxParticipants: Number(maxParticipants),
          durationMinutes: Number(durationMinutes),
        },
        savedTaskId,
        signal,
      );
    });
    if (id !== undefined) void navigate('/lobbies/' + id, { replace: true });
  }

  return (
    <section className="lobby-page">
      <h1>Utwórz lobby</h1>
      <form className="lobby-form" onSubmit={(event) => void create(event)}>
        {action.error && (
          <Alert title={action.error} variant="error" announce />
        )}
        <fieldset disabled={action.pending} className="lobby-panel">
          <legend>Ustawienia lobby</legend>
          <FormField
            label="Nazwa lobby"
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="lobby-columns">
            <FormField
              label="Liczba miejsc"
              type="number"
              min={2}
              max={20}
              required
              value={maxParticipants}
              onChange={(event) => setMaxParticipants(event.target.value)}
            />
            <FormField
              label="Czas sesji (minuty)"
              type="number"
              min={5}
              max={120}
              required
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
            />
          </div>
        </fieldset>
        {taskId === undefined ? (
          <fieldset
            disabled={action.pending || importing}
            className="lobby-panel"
          >
            <legend>Zadanie w Javie</legend>
            <div className="lobby-task-actions">
              <Button variant="secondary" onClick={() => resetTask(false)}>
                Zacznij od zera
              </Button>
              <Button variant="secondary" onClick={() => resetTask(true)}>
                Wstaw przykład
              </Button>
            </div>
            <FormField
              label="Tytuł"
              required
              maxLength={200}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <label className="lobby-field">
              Opis
              <textarea
                rows={3}
                required
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </label>
            <h2>Pliki zadania</h2>
            <div
              className="lobby-file-drop"
              onDragOver={(event) => {
                if (!event.dataTransfer.types.includes('Files')) return;
                event.preventDefault();
                event.dataTransfer.dropEffect =
                  action.pending || importing ? 'none' : 'copy';
              }}
              onDrop={(event) => {
                if (!event.dataTransfer.types.includes('Files')) return;
                event.preventDefault();
                void importFiles(Array.from(event.dataTransfer.files));
              }}
            >
              <Icon name="file" />
              <div>
                <p>Przeciągnij tutaj pliki .java</p>
                <small>
                  Import pliku o tej samej ścieżce zastępuje jego treść.
                </small>
              </div>
              <input
                ref={fileInput}
                type="file"
                aria-label="Pliki Java do importu"
                accept=".java"
                multiple
                hidden
                onChange={(event) => {
                  const selected = Array.from(event.currentTarget.files ?? []);
                  event.currentTarget.value = '';
                  void importFiles(selected);
                }}
              />
              <Button
                variant="secondary"
                onClick={() => fileInput.current?.click()}
              >
                Wybierz pliki
              </Button>
            </div>
            {(importing || importStatus) && (
              <p role="status">
                {importing ? 'Odczytywanie plików…' : importStatus}
              </p>
            )}
            {importError && (
              <Alert title={importError} variant="error" announce />
            )}
            {selectedFile && (
              <div className="lobby-source-workspace">
                <WorkspaceFiles
                  className="lobby-source-files"
                  files={files.map((file) => ({
                    id: file.key,
                    path: file.path || 'Nowy plik',
                    role: file.type,
                  }))}
                  selected={selectedFile.key}
                  open={setSelectedFileKey}
                />
                <div className="lobby-file-editor">
                  <div className="lobby-columns">
                    <FormField
                      label="Ścieżka"
                      maxLength={240}
                      placeholder="src/Solution.java"
                      value={selectedFile.path}
                      onChange={(event) =>
                        editFile(selectedFile.key, { path: event.target.value })
                      }
                    />
                    <label className="lobby-field">
                      Typ pliku dla uczestnika
                      <select
                        value={selectedFile.type}
                        onChange={(event) =>
                          editFile(selectedFile.key, {
                            type: event.target.value as FileRole,
                          })
                        }
                      >
                        {Object.entries(fileRoles).map(([role, label]) => (
                          <option key={role} value={role}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div
                    className="lobby-source-editor"
                    inert={action.pending || importing}
                  >
                    <JavaEditor
                      key={selectedFile.key}
                      file={{
                        path: selectedFile.path || 'Nowy plik',
                        role: 'EDITABLE',
                      }}
                      content={selectedFile.content}
                      onChange={editSource}
                    />
                  </div>
                  <Button variant="secondary" onClick={removeSelectedFile}>
                    Usuń plik
                  </Button>
                </div>
              </div>
            )}
            <Button
              variant="secondary"
              onClick={addFile}
              disabled={files.length >= maxSourceFiles}
            >
              Utwórz pusty plik
            </Button>
            <h2>Testy publiczne</h2>
            <div className="lobby-columns">
              <FormField
                label="Klasa uruchamiająca testy"
                hint="Podaj nazwę klasy z main. Jeśli plik ma pakiet, wpisz np. demo.PublicTests."
                placeholder="PublicTests"
                required
                maxLength={240}
                value={mainClass}
                onChange={(event) => setMainClass(event.target.value)}
              />
              <FormField
                label="Identyfikatory testów"
                hint="Wpisz identyfikatory z raportu testów. Oddziel je przecinkami."
                placeholder="public-1"
                required
                value={testIds}
                onChange={(event) => setTestIds(event.target.value)}
              />
            </div>
          </fieldset>
        ) : (
          <p role="status">Zadanie #{taskId} zostało zapisane.</p>
        )}
        {formError && <Alert title={formError} variant="error" announce />}
        <Button
          type="submit"
          disabled={importing}
          loading={action.pending}
          loadingLabel="Tworzenie…"
        >
          Utwórz lobby
        </Button>
      </form>
    </section>
  );
}
