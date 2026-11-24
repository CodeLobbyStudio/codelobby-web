import type { RunOutcome } from './runTypes';
import { runVerdictLabel } from './runTypes';

function diagnostic(value: unknown) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

export function RunResults({
  outcome,
  tests,
  stale,
}: {
  outcome: RunOutcome;
  tests: readonly { id: string; title: string }[];
  stale: boolean;
}) {
  if (outcome.kind === 'error') {
    return (
      <div role="alert">
        <p>{outcome.message}</p>
        {outcome.retryable && <p>Możesz ponowić próbę ręcznie.</p>}
      </div>
    );
  }

  const { result } = outcome;
  return (
    <>
      <p className="workspace-verdict" role="status">
        <strong
          className="workspace-result-status"
          data-verdict={result.status}
        >
          {result.status === 'ACCEPTED'
            ? 'Wszystkie testy zaliczone'
            : runVerdictLabel(result.status)}
        </strong>
        <span>
          {result.passedTests} / {result.totalTests} zaliczone
        </span>
        {stale && (
          <span className="workspace-stale">
            Wynik dotyczy poprzedniej treści plików.
          </span>
        )}
      </p>
      {result.compileOutput && (
        <pre className="workspace-diagnostic">{result.compileOutput}</pre>
      )}
      {result.testResults.map((test) => {
        const fields = [
          ['Wejście', test.input],
          ['Oczekiwany wynik', test.expectedOutput],
          ['Otrzymany wynik', test.actualOutput],
        ] as const;
        const title =
          tests.find(({ id }) => id === test.testId)?.title ?? test.testId;
        return (
          <details key={test.testId}>
            <summary>
              {title} ·{' '}
              <strong
                className="workspace-result-status"
                data-verdict={test.status}
              >
                {runVerdictLabel(test.status)}
              </strong>
            </summary>
            {fields.every(([, value]) => value == null) ? (
              <p>Szczegóły diagnostyczne są niedostępne.</p>
            ) : (
              <dl>
                {fields.map(
                  ([label, value]) =>
                    value != null && (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          <code>{diagnostic(value)}</code>
                        </dd>
                      </div>
                    ),
                )}
              </dl>
            )}
          </details>
        );
      })}
    </>
  );
}
