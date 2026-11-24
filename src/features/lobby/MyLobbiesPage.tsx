import { Link } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { Icon } from '../../shared/components/Icon';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { lobbyApi, lobbyRoleLabels, lobbyStatusLabels } from './lobbyApi';
import { useLobbyResource } from './useLobbyRequest';
import './lobby.css';

export function MyLobbiesPage() {
  const { data, error, refresh } = useLobbyResource(lobbyApi.list);

  return (
    <section className="lobby-page">
      <h1>Moje lobby</h1>
      <div className="lobby-task-actions">
        <Link className="codelobby-button button--primary" to="/lobbies/new">
          Utwórz lobby
        </Link>
        <Link className="codelobby-button button--secondary" to="/lobbies/join">
          Dołącz kodem
        </Link>
      </div>
      {error && (
        <>
          <Alert title={error} variant="error" announce />
          <Button variant="secondary" onClick={refresh}>
            Załaduj ponownie
          </Button>
        </>
      )}
      {!data && !error && <LoadingIndicator label="Ładowanie lobby…" />}
      {data &&
        (data.length === 0 ? (
          <p>
            Gdy utworzysz lobby lub dołączysz do sesji, znajdziesz je tutaj.
          </p>
        ) : (
          <ul className="lobby-link-list">
            {data.map(({ id, name, status, role }) => (
              <li key={id}>
                <Link className="lobby-entry-link" to={`/lobbies/${id}`}>
                  <span>
                    <strong>{name}</strong>
                    <small>
                      {lobbyRoleLabels[role]} · {lobbyStatusLabels[status]}
                    </small>
                  </span>
                  <Icon name="arrowRight" />
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}
