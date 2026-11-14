import { demoTask, type Scenario } from './demoTask';
import type { RunOutcome, RunSnapshot } from './runTypes';

const statusByScenario = {
  accepted: 'ACCEPTED',
  wrongAnswer: 'WRONG_ANSWER',
  compilationError: 'COMPILATION_ERROR',
  timeLimit: 'TIME_LIMIT_EXCEEDED',
} as const;

export function simulateRun(
  snapshot: RunSnapshot,
  scenario: Scenario,
): RunOutcome {
  if (
    snapshot.taskVersionId !== demoTask.versionId ||
    scenario === 'unavailable'
  ) {
    return {
      kind: 'error',
      code: 'EXECUTION_UNAVAILABLE',
      message: 'Usługa uruchamiania jest chwilowo niedostępna.',
      retryable: true,
    };
  }
  if (scenario === 'timeout') {
    return {
      kind: 'error',
      code: 'CLIENT_TIMEOUT',
      message:
        'Upłynął czas oczekiwania na odpowiedź. Wykonanie może nadal trwać.',
      retryable: false,
    };
  }

  const status = statusByScenario[scenario];
  const testResults = demoTask.tests.map((test, index) => {
    const testStatus =
      status === 'COMPILATION_ERROR' ||
      (status === 'TIME_LIMIT_EXCEEDED' && index > 0)
        ? 'NOT_RUN'
        : status === 'WRONG_ANSWER' && index > 0
          ? 'ACCEPTED'
          : status;
    const hasDiagnostics =
      testStatus === 'ACCEPTED' || testStatus === 'WRONG_ANSWER';
    return {
      testId: test.id,
      status: testStatus,
      input: hasDiagnostics ? JSON.parse(test.input) : null,
      expectedOutput: hasDiagnostics ? Number(test.expected) : null,
      actualOutput: hasDiagnostics
        ? testStatus === 'ACCEPTED'
          ? Number(test.expected)
          : 0
        : null,
    };
  });
  return {
    kind: 'result',
    result: {
      status,
      passedTests: testResults.filter((test) => test.status === 'ACCEPTED')
        .length,
      totalTests: testResults.length,
      testResults,
      compileOutput:
        status === 'COMPILATION_ERROR'
          ? 'src/Solution.java:3: error: missing return statement'
          : null,
    },
  };
}
