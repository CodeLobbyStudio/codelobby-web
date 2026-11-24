import { useId, useState } from 'react';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { runVerdictLabel } from '../workspace/runTypes';
import { lobbyApi, type SubmissionEvaluation } from './lobbyApi';
import { useLobbyAction } from './useLobbyRequest';

const milliseconds = new Intl.NumberFormat('pl-PL', {
  style: 'unit',
  unit: 'millisecond',
  maximumFractionDigits: 2,
});

type ReviewProps = {
  lobbyId: number;
  submissionId: number;
  initialEvaluation: SubmissionEvaluation | null;
};

export function SubmissionReview({
  lobbyId,
  submissionId,
  initialEvaluation,
}: ReviewProps) {
  const heading = useId();
  const [evaluation, setEvaluation] = useState(initialEvaluation);
  const check = useLobbyAction();

  async function evaluate() {
    const result = await check.submit((signal) =>
      lobbyApi.evaluateSubmission(lobbyId, submissionId, signal),
    );
    if (result) setEvaluation(result);
  }

  return (
    <section className="lobby-review" aria-labelledby={heading}>
      <h3 id={heading}>Ocena rozwiązania</h3>
      <dl className="lobby-review-metrics">
        <div>
          <dt>Testy jawne</dt>
          <dd>
            {evaluation ? (
              <>
                <strong>
                  {evaluation.passedTests} / {evaluation.totalTests} zaliczonych
                </strong>
                {evaluation.status !== 'ACCEPTED' && (
                  <span>{runVerdictLabel(evaluation.status)}</span>
                )}
              </>
            ) : (
              'Nie sprawdzono'
            )}
          </dd>
        </div>
        <div>
          <dt>Testy niejawne</dt>
          <dd>Niedostępne</dd>
        </div>
        <div>
          <dt>Czas CPU testów jawnych</dt>
          <dd>
            {evaluation?.sandboxCpuTimeMs == null
              ? '—'
              : milliseconds.format(evaluation.sandboxCpuTimeMs)}
          </dd>
        </div>
      </dl>
      {check.error && <Alert title={check.error} variant="error" announce />}
      {!evaluation && (
        <Button
          variant="secondary"
          loading={check.pending}
          loadingLabel="Sprawdzanie…"
          onClick={() => void evaluate()}
        >
          Sprawdź testy jawne
        </Button>
      )}
      {evaluation && !initialEvaluation && (
        <p className="lobby-submission-meta" role="status">
          Zapisano wynik testów jawnych.
        </p>
      )}
    </section>
  );
}
