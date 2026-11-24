import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Icon } from '../../shared/components/Icon';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import {
  lobbyApi,
  lobbyRoleLabels,
  lobbyStatusLabels,
  positiveId,
} from './lobbyApi';
import { useLobbyAction, useLobbyResource } from './useLobbyRequest';
import { LobbyParticipantProgress } from './LobbyParticipantProgress';
import { LobbySubmissions } from './LobbySubmissions';
import './lobby.css';

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
  const [copyStatus, setCopyStatus] = useState('');

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

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(invite.href);
      setCopyStatus('Link skopiowany.');
    } catch {
      setCopyStatus('Zaznacz link w polu i skopiuj go ręcznie.');
    }
  }

  return (
    <section className="lobby-page lobby-room">
      <header className="lobby-room-header">
        <div>
          <h1>{lobby.name}</h1>
          <p role="status">
            {lobbyStatusLabels[lobby.status]} · {lobbyRoleLabels[lobby.role]}
          </p>
        </div>
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
      </header>
      {error && <Alert title={error} variant="error" announce />}
      {action.error && <Alert title={action.error} variant="error" announce />}
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
      {lobby.status === 'WAITING' && lobby.role === 'HOST' && (
        <section className="lobby-panel" aria-labelledby="lobby-invite-heading">
          <h2 id="lobby-invite-heading">Zaproś uczestników</h2>
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
          <div className="lobby-invite-actions">
            <Button variant="secondary" onClick={() => void copyInvite()}>
              Skopiuj link
            </Button>
            <Button
              onClick={() => void changeStatus('start')}
              loading={action.pending}
              loadingLabel="Uruchamianie sesji…"
            >
              Rozpocznij sesję
            </Button>
          </div>
          {copyStatus && <p role="status">{copyStatus}</p>}
        </section>
      )}
      {lobby.status === 'WAITING' && lobby.role === 'PARTICIPANT' && (
        <p className="lobby-next-step">
          Link do edytora pojawi się tutaj, gdy prowadzący rozpocznie sesję.
        </p>
      )}
      <section>
        <h2>Zadania</h2>
        <ol className="lobby-link-list">
          {lobby.tasks.map(({ taskId, title, position, submitted }) => (
            <li key={taskId}>
              {submitted ? (
                <span className="lobby-task-title">
                  {title}
                  <span className="lobby-submission-status">
                    <Icon name="checkCircle" /> Wysłane
                  </span>
                </span>
              ) : lobby.status === 'ACTIVE' ? (
                <Link
                  className="lobby-entry-link"
                  to={`/lobbies/${id}/tasks/${taskId}`}
                >
                  <span>
                    <strong>
                      {lobby.role === 'HOST' ? `${position + 1}. ` : ''}
                      {title}
                    </strong>
                    <small>Otwórz edytor</small>
                  </span>
                  <Icon name="arrowRight" />
                </Link>
              ) : (
                <span className="lobby-task-title">
                  {lobby.role === 'HOST' ? `${position + 1}. ` : ''}
                  {title}
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>
      {lobby.role === 'HOST' ? (
        <LobbyParticipantProgress lobby={lobby} />
      ) : (
        <section>
          <h2>
            Uczestnicy ({lobby.members.length}/{lobby.maxParticipants})
          </h2>
          <ul>
            {lobby.members.map(({ userId, role }) => (
              <li key={userId}>
                {lobbyRoleLabels[role]} #{userId}
              </li>
            ))}
          </ul>
        </section>
      )}
      {lobby.role === 'HOST' &&
        (lobby.status === 'FINISHED' || lobby.status === 'CLOSED') && (
          <LobbySubmissions lobbyId={id} />
        )}
    </section>
  );
}
