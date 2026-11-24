export type RunSnapshot = {
  taskVersionId: string;
  files: { path: string; content: string }[];
};

export type TestResult = {
  testId: string;
  status: string;
  input: unknown;
  expectedOutput: unknown;
  actualOutput: unknown;
};

export type RunResult = {
  status: string;
  passedTests: number;
  totalTests: number;
  testResults: TestResult[];
  compileOutput: string | null;
};

export type RunOutcome =
  | { kind: 'result'; result: RunResult }
  | { kind: 'error'; code: string; message: string; retryable: boolean };

const verdictLabels = new Map([
  ['ACCEPTED', 'Zaliczony'],
  ['WRONG_ANSWER', 'Błędny wynik'],
  ['COMPILATION_ERROR', 'Błąd kompilacji'],
  ['TIME_LIMIT_EXCEEDED', 'Przekroczony limit czasu'],
  ['MEMORY_LIMIT_EXCEEDED', 'Przekroczony limit pamięci'],
  ['RUNTIME_ERROR', 'Błąd wykonania'],
  ['OUTPUT_LIMIT_EXCEEDED', 'Przekroczony limit danych wyjściowych'],
  ['EXECUTION_ERROR', 'Błąd uruchomienia testów'],
  ['NOT_RUN', 'Nie uruchomiono'],
]);

export function runVerdictLabel(status: string) {
  return verdictLabels.get(status) ?? status;
}
