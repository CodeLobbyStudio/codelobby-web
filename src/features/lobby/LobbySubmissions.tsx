import { useCallback, useId, useState } from 'react';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';
import { lobbyApi } from './lobbyApi';
import { SubmissionReview } from './SubmissionReview';
import { useLobbyResource } from './useLobbyRequest';

const submittedTime = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'short',
  timeStyle: 'short',
});

export function LobbySubmissions({ lobbyId }: { lobbyId: number }) {
  const heading = useId();
  const [selected, setSelected] = useState<number>();
  const load = useCallback(
    (signal: AbortSignal) => lobbyApi.submissions(lobbyId, signal),
    [lobbyId],
  );
  const { data, error, refresh } = useLobbyResource(load);

  return (
    <section className="lobby-submissions" aria-labelledby={heading}>
      <h2 id={heading}>Oddane rozwiązania</h2>
      {error && (
        <>
          <Alert title={error} variant="error" announce />
          <Button variant="secondary" onClick={refresh}>
            Załaduj ponownie
          </Button>
        </>
      )}
      {!data && !error && <LoadingIndicator label="Ładowanie rozwiązań…" />}
      {data?.length === 0 && <p>W tym lobby nie oddano żadnych rozwiązań.</p>}
      {!!data?.length && (
        <ul className="lobby-link-list">
          {data.map((item) => (
            <li key={item.id} className="lobby-submission">
              <div className="lobby-task-title">
                <div>
                  <strong>{item.title}</strong>
                  <p className="lobby-submission-meta">
                    Uczestnik #{item.userId} ·{' '}
                    <time dateTime={item.submittedAt}>
                      {submittedTime.format(new Date(item.submittedAt))}
                    </time>
                  </p>
                </div>
                <Button
                  variant="secondary"
                  aria-expanded={selected === item.id}
                  aria-label={`Kod zadania „${item.title}”, uczestnik #${item.userId}`}
                  onClick={() =>
                    setSelected((current) =>
                      current === item.id ? undefined : item.id,
                    )
                  }
                >
                  {selected === item.id ? 'Zwiń kod' : 'Zobacz kod'}
                </Button>
              </div>
              {selected === item.id && (
                <SubmittedCode
                  key={item.id}
                  lobbyId={lobbyId}
                  submissionId={item.id}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SubmittedCode({
  lobbyId,
  submissionId,
}: {
  lobbyId: number;
  submissionId: number;
}) {
  const [path, setPath] = useState('');
  const load = useCallback(
    (signal: AbortSignal) =>
      lobbyApi.submissionReview(lobbyId, submissionId, signal),
    [lobbyId, submissionId],
  );
  const { data, error, refresh } = useLobbyResource(load);
  const file = data?.files.find((item) => item.path === path) ?? data?.files[0];

  if (error) {
    return (
      <div className="lobby-panel lobby-submitted-code">
        <Alert title={error} variant="error" announce />
        <Button variant="secondary" onClick={refresh}>
          Załaduj ponownie
        </Button>
      </div>
    );
  }
  if (!data) return <LoadingIndicator label="Ładowanie kodu…" />;

  return (
    <div className="lobby-panel lobby-submitted-code">
      <SubmissionReview
        lobbyId={lobbyId}
        submissionId={submissionId}
        initialEvaluation={data.publicEvaluation}
      />
      {file && data.files.length > 1 && (
        <label className="lobby-field">
          Plik rozwiązania
          <select
            value={file.path}
            onChange={(event) => setPath(event.target.value)}
          >
            {data.files.map(({ path }) => (
              <option key={path}>{path}</option>
            ))}
          </select>
        </label>
      )}
      {file ? (
        <>
          <p className="lobby-submission-meta">
            {file.path} · Tylko do odczytu
          </p>
          <pre tabIndex={0} aria-label={file.path}>
            <code>{file.content}</code>
          </pre>
        </>
      ) : (
        <p>W rozwiązaniu nie ma plików do wyświetlenia.</p>
      )}
    </div>
  );
}
