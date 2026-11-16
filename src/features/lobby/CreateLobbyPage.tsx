import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { FormField } from '../../shared/components/FormField';
import { javaExample } from './javaExample';
import { lobbyApi } from './lobbyApi';
import type { FileRole, TaskFile } from './lobbyApi';
import { useLobbyAction } from './useLobbyRequest';
import './lobby.css';

const initialJava = javaExample.languages[0];
const fileRoles: Record<FileRole, string> = {
  EDITABLE: 'Do edycji',
  READ_ONLY: 'Tylko do odczytu',
  VISIBLE_TEST: 'Źródło testów publicznych',
};

type FileRow = TaskFile & { key: number };

export function CreateLobbyPage() {
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
  const nextFileKey = useRef(initialJava.files.length);
  const [taskId, setTaskId] = useState<number>();
  const [name, setName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('2');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const action = useLobbyAction();

  function editFile(key: number, patch: Partial<TaskFile>) {
    setFiles((current) =>
      current.map((file) => (file.key === key ? { ...file, ...patch } : file)),
    );
  }

  function addFile() {
    const key = nextFileKey.current++;
    setFiles((current) => [
      ...current,
      { key, path: '', type: 'EDITABLE', content: '' },
    ]);
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
                  testIds: testIds
                    .split(',')
                    .map((id) => id.trim())
                    .filter(Boolean),
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
    if (id !== undefined) void navigate('/lobbies/' + id);
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
          <fieldset disabled={action.pending} className="lobby-panel">
            <legend>Zadanie w Javie</legend>
            <FormField
              label="Tytuł"
              required
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
            <div className="lobby-columns">
              <FormField
                label="Klasa uruchamiająca testy"
                required
                value={mainClass}
                onChange={(event) => setMainClass(event.target.value)}
              />
              <FormField
                label="Identyfikatory testów"
                hint="Oddziel identyfikatory przecinkami."
                required
                value={testIds}
                onChange={(event) => setTestIds(event.target.value)}
              />
            </div>
            {files.map((file) => (
              <fieldset key={file.key} className="lobby-file">
                <legend>{file.path || 'Nowy plik'}</legend>
                <div className="lobby-columns">
                  <FormField
                    label="Ścieżka"
                    required
                    value={file.path}
                    onChange={(event) =>
                      editFile(file.key, { path: event.target.value })
                    }
                  />
                  <label className="lobby-field">
                    Typ pliku
                    <select
                      value={file.type}
                      onChange={(event) =>
                        editFile(file.key, {
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
                <label className="lobby-field">
                  Treść pliku
                  <textarea
                    className="lobby-source"
                    rows={5}
                    spellCheck={false}
                    value={file.content}
                    onChange={(event) =>
                      editFile(file.key, { content: event.target.value })
                    }
                  />
                </label>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setFiles((current) =>
                      current.filter(({ key }) => key !== file.key),
                    )
                  }
                >
                  Usuń plik
                </Button>
              </fieldset>
            ))}
            <Button variant="secondary" onClick={addFile}>
              Dodaj plik
            </Button>
          </fieldset>
        ) : (
          <p role="status">Zadanie #{taskId} zostało zapisane.</p>
        )}
        <Button type="submit" loading={action.pending} loadingLabel="Tworzenie…">
          Utwórz lobby
        </Button>
      </form>
    </section>
  );
}
