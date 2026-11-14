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

export type RunOutcome =
  | {
      kind: 'result';
      result: {
        status: string;
        passedTests: number;
        totalTests: number;
        testResults: TestResult[];
        compileOutput: string | null;
      };
    }
  | { kind: 'error'; code: string; message: string; retryable: boolean };
