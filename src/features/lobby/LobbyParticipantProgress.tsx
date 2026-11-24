import type { Lobby, LobbyTaskProgress } from './lobbyApi';

const statusLabels: Record<LobbyTaskProgress, string> = {
  NOT_OPENED: 'Nie otwarto',
  OPENED: 'Otwarto',
  SUBMITTED: 'Wysłano',
};

export function LobbyParticipantProgress({ lobby }: { lobby: Lobby }) {
  const participants = lobby.members.filter(
    ({ role }) => role === 'PARTICIPANT',
  );
  const heading = (
    <h2>
      Uczestnicy ({participants.length}/{lobby.maxParticipants - 1})
    </h2>
  );
  if (!participants.length) {
    return (
      <section>
        {heading}
        <p>Nikt jeszcze nie dołączył do lobby.</p>
      </section>
    );
  }

  const progress = new Map(
    lobby.participantProgress?.map((item) => [item.userId, item]),
  );

  return (
    <section>
      {heading}
      <div
        className="lobby-progress-scroll"
        role="region"
        aria-label="Postęp uczestników"
        tabIndex={0}
      >
        <table className="lobby-progress-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Uczestnik</th>
              {lobby.tasks.map(({ taskId, title, position }) => (
                <th
                  key={taskId}
                  scope="col"
                  title={title}
                  className="lobby-progress-task"
                >
                  Zad. {position + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map(({ userId }) => {
              const participant = progress.get(userId);
              return (
                <tr key={userId}>
                  <td>{participant?.emailId ?? '—'}</td>
                  <th scope="row">Uczestnik #{userId}</th>
                  {lobby.tasks.map(({ taskId }) => (
                    <td key={taskId} className="lobby-progress-task">
                      <ProgressDot
                        status={participant?.tasks[taskId] ?? 'NOT_OPENED'}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {lobby.tasks.length > 0 && (
        <ul className="lobby-progress-legend" aria-label="Znaczenie statusów">
          {(['NOT_OPENED', 'OPENED', 'SUBMITTED'] as const).map((status) => (
            <li key={status}>
              <span
                className="lobby-progress-dot"
                data-status={status}
                aria-hidden="true"
              />
              {statusLabels[status]}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProgressDot({ status }: { status: LobbyTaskProgress }) {
  const label = statusLabels[status];
  return (
    <span
      className="lobby-progress-dot"
      data-status={status}
      role="img"
      aria-label={label}
      title={label}
    />
  );
}
