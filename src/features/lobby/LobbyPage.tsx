import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { lobbyApi, positiveId } from './lobbyApi';
import type { LobbyStatus } from './lobbyApi';
import { useLobbyAction, useLobbyResource } from './useLobbyRequest';
import './lobby.css';

const statusLabels: Record<LobbyStatus, string> = {
  WAITING: 'Oczekiwanie na start',
  ACTIVE: 'Sesja trwa',
  FINISHED: 'Sesja zakończona',
  CLOSED: 'Lobby zamknięte',
};

export function LobbyPage() {
  const id = positiveId(useParams().lobbyId);
  if (id === null) return <Alert title="Nieprawidłowy adres lobby." announce />;
  return <LobbyDetails key={id} id={id} />;
}

function LobbyDetails({ id }: { id: number }) {
  const read = useCallback(
    (signal: AbortSignal) => lobbyApi.details(id, signal),
    [id],
  );
  const { data: lobby, error, refresh } = useLobbyResource(read, 2000);
  const action = useLobbyAction();

  async function changeStatus(command: 'start' | 'finish') {
    const result = await action.submit((signal) =>
      lobbyApi.changeStatus(id, command, signal),
    );
    if (result) refresh();
  }

  if (!lobby) {
    return error ? (
      <section className="lobby-page">
        <Alert title={error} variant="error" announce />
        <Button variant="secondary" onClick={refresh}>
          Odśwież
        </Button>
      </section>
    ) : (
      <LoadingIndicator label="Ładowanie lobby…" />
    );
  }

  const invite = new URL('/lobbies/join', window.location.origin);
  invite.searchParams.set('code', lobby.joinCode);

  return (
    <section className="lobby-page">
      <h1>{lobby.name}</h1>
      <p role="status">{statusLabels[lobby.status]}</p>
      {error && <Alert title={error} variant="error" announce />}
      {action.error && (
        <Alert title={action.error} variant="error" announce />
      )}
      <dl className="lobby-metadata">
        <div>
          <dt>Języki</dt>
          <dd>{lobby.allowedLanguages.join(', ')}</dd>
        </div>
        <div>
          <dt>Czas sesji</dt>
          <dd>{lobby.durationMinutes} min</dd>
        </div>
        {lobby.status === 'ACTIVE' && lobby.endsAt && (
          <div>
            <dt>Koniec sesji</dt>
            <dd>{new Date(lobby.endsAt).toLocaleTimeString('pl-PL')}</dd>
          </div>
        )}
      </dl>
      {lobby.status === 'WAITING' && (
        <div className="lobby-panel">
          <p>
            Kod dołączenia <strong>{lobby.joinCode}</strong>
          </p>
          <label className="lobby-field">
            Link do zaproszenia
            <input
              readOnly
              value={invite.href}
              onFocus={(event) => event.currentTarget.select()}
            />
          </label>
        </div>
      )}
      <section>
        <h2>
          Uczestnicy ({lobby.members.length}/{lobby.maxParticipants})
        </h2>
        <ul>
          {lobby.members.map(({ userId, role }) => (
            <li key={userId}>
              {role === 'HOST' ? 'Host' : 'Uczestnik'} #{userId}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Zadania</h2>
        <ol>
          {lobby.tasks.map(({ taskId, title }) => (
            <li key={taskId}>
              {lobby.status === 'ACTIVE' ? (
                <Link to={`/lobbies/${id}/tasks/${taskId}`}>{title}</Link>
              ) : (
                title
              )}
            </li>
          ))}
        </ol>
      </section>
      {lobby.role === 'HOST' && lobby.status === 'WAITING' && (
        <Button
          onClick={() => void changeStatus('start')}
          loading={action.pending}
          loadingLabel="Uruchamianie sesji…"
        >
          Rozpocznij sesję
        </Button>
      )}
      {lobby.role === 'HOST' && lobby.status === 'ACTIVE' && (
        <Button
          variant="secondary"
          onClick={() => void changeStatus('finish')}
          loading={action.pending}
          loadingLabel="Kończenie sesji…"
        >
          Zakończ sesję
        </Button>
      )}
    </section>
  );
}
