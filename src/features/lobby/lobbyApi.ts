import { session } from '../auth/session';
import { ApiError, getJson, isRecord, postJson } from '../../shared/api/http';
import type { RunResult, RunSnapshot, TestResult } from '../workspace/runTypes';

export type LobbyStatus = 'WAITING' | 'ACTIVE' | 'FINISHED' | 'CLOSED';
export type LobbyRole = 'HOST' | 'PARTICIPANT';
export type FileRole = 'EDITABLE' | 'READ_ONLY' | 'VISIBLE_TEST';

export type TaskFile = { path: string; type: FileRole; content: string };
export type JavaTaskInput = {
  title: string;
  description: string;
  difficulty: 'EASY';
  languages: {
    language: 'JAVA';
    files: TaskFile[];
    javaPublicTests: { mainClass: string; testIds: string[] };
  }[];
};

export type LobbySettings = {
  name: string;
  maxParticipants: number;
  durationMinutes: number;
};

type LobbyMember = { userId: number; role: LobbyRole };
export type LobbyTaskProgress = 'NOT_OPENED' | 'OPENED' | 'SUBMITTED';
type ParticipantProgress = {
  userId: number;
  emailId: string;
  tasks: Partial<Record<number, LobbyTaskProgress>>;
};
type LobbyTask = {
  taskId: number;
  title: string;
  position: number;
  submitted: boolean;
};

export type LobbySubmission = {
  id: number;
  userId: number;
  taskId: number;
  title: string;
  submittedAt: string;
};

export type SubmissionEvaluation = {
  status: string;
  passedTests: number;
  totalTests: number;
  sandboxCpuTimeMs: number | null;
};

export type Lobby = {
  id: number;
  name: string;
  joinCode: string;
  status: LobbyStatus;
  role: LobbyRole;
  maxParticipants: number;
  durationMinutes: number;
  endsAt: string | null;
  allowedLanguages: string[];
  members: LobbyMember[];
  tasks: LobbyTask[];
  participantProgress?: ParticipantProgress[];
};

export type LobbySummary = Pick<Lobby, 'id' | 'name' | 'status' | 'role'>;

export const lobbyStatusLabels: Record<LobbyStatus, string> = {
  WAITING: 'Oczekiwanie na start',
  ACTIVE: 'Sesja trwa',
  FINISHED: 'Sesja zakończona',
  CLOSED: 'Lobby zamknięte',
};

export const lobbyRoleLabels: Record<LobbyRole, string> = {
  HOST: 'Prowadzący',
  PARTICIPANT: 'Uczestnik',
};

export type WorkspaceFile = {
  path: string;
  role: 'EDITABLE' | 'READ_ONLY';
  content: string;
};

export type Workspace = {
  taskVersionId: string;
  title: string;
  description: string;
  files: WorkspaceFile[];
  canSubmit: boolean;
  tests: {
    id: string;
    title: string;
    input?: string;
    expectedOutput?: string;
  }[];
};

function invalidResponse(): never {
  throw new ApiError('INVALID_RESPONSE');
}

function record(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : invalidResponse();
}

function string(value: unknown): string {
  return typeof value === 'string' ? value : invalidResponse();
}

function number(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    ? value
    : invalidResponse();
}

function optionalFlag(value: unknown): boolean {
  if (value === undefined) return false;
  return typeof value === 'boolean' ? value : invalidResponse();
}

function array<T>(value: unknown, read: (item: unknown) => T): T[] {
  return Array.isArray(value) ? value.map(read) : invalidResponse();
}

function role(value: unknown): LobbyRole {
  return value === 'HOST' || value === 'PARTICIPANT'
    ? value
    : invalidResponse();
}

function status(value: unknown): LobbyStatus {
  return value === 'WAITING' ||
    value === 'ACTIVE' ||
    value === 'FINISHED' ||
    value === 'CLOSED'
    ? value
    : invalidResponse();
}

function lobbySummary(value: unknown): LobbySummary {
  const data = record(value);
  return {
    id: number(data.id),
    name: string(data.name),
    status: status(data.status),
    role: role(data.role),
  };
}

function lobby(value: unknown): Lobby {
  const data = record(value);
  const summary = lobbySummary(data);
  return {
    ...summary,
    joinCode: string(data.joinCode),
    maxParticipants: number(data.maxParticipants),
    durationMinutes: number(data.durationMinutes),
    endsAt: data.endsAt === null ? null : string(data.endsAt),
    allowedLanguages: array(data.allowedLanguages, string),
    members: array(data.members, (value) => {
      const item = record(value);
      return { userId: number(item.userId), role: role(item.role) };
    }),
    tasks: array(data.tasks, (value) => {
      const item = record(value);
      return {
        taskId: number(item.taskId),
        title: string(item.title),
        position: number(item.position),
        submitted: optionalFlag(item.submitted),
      };
    }),
    ...(summary.role === 'HOST' &&
      data.participantProgress !== undefined && {
        participantProgress: array(
          data.participantProgress,
          readParticipantProgress,
        ),
      }),
  };
}

function readParticipantProgress(value: unknown): ParticipantProgress {
  const data = record(value);
  const tasks: ParticipantProgress['tasks'] = {};
  for (const [taskId, progress] of Object.entries(record(data.tasks))) {
    const id = positiveId(taskId);
    if (id === null || (progress !== 'OPENED' && progress !== 'SUBMITTED')) {
      return invalidResponse();
    }
    tasks[id] = progress;
  }
  return { userId: number(data.userId), emailId: string(data.emailId), tasks };
}

function workspaceFile(value: unknown): WorkspaceFile {
  const file = record(value);
  if (file.type !== 'EDITABLE' && file.type !== 'READ_ONLY') {
    return invalidResponse();
  }
  return {
    path: string(file.path),
    role: file.type,
    content: string(file.content),
  };
}

function workspace(value: unknown): Workspace {
  const data = record(value);
  const files = array(data.files, workspaceFile);
  if (
    data.language !== 'JAVA' ||
    !files.some((file) => file.role === 'EDITABLE')
  ) {
    return invalidResponse();
  }
  return {
    taskVersionId: string(data.taskVersionId),
    title: string(data.title),
    description: string(data.description),
    files,
    canSubmit: optionalFlag(data.canSubmit),
    tests: array(data.publicTests, (value) => {
      const test = record(value);
      const id = string(test.testId);
      return {
        id,
        title: test.title === undefined ? id : string(test.title),
        ...(test.input !== undefined && { input: string(test.input) }),
        ...(test.expectedOutput !== undefined && {
          expectedOutput: string(test.expectedOutput),
        }),
      };
    }),
  };
}

function submission(value: unknown): LobbySubmission {
  const data = record(value);
  return {
    id: number(data.id),
    userId: number(data.userId),
    taskId: number(data.taskId),
    title: string(data.title),
    submittedAt: string(data.submittedAt),
  };
}

function submissionEvaluation(value: unknown): SubmissionEvaluation {
  const data = record(value);
  const passedTests = number(data.passedTests);
  const totalTests = number(data.totalTests);
  const cpuTime = data.sandboxCpuTimeMs ?? null;
  if (
    totalTests === 0 ||
    passedTests > totalTests ||
    (cpuTime !== null &&
      (typeof cpuTime !== 'number' || !Number.isFinite(cpuTime) || cpuTime < 0))
  ) {
    return invalidResponse();
  }
  return {
    status: string(data.status),
    passedTests,
    totalTests,
    sandboxCpuTimeMs: cpuTime,
  };
}

function submissionPath(lobbyId: number, submissionId: number) {
  return `/lobbies/${lobbyId}/submissions/${submissionId}`;
}

function testResult(value: unknown): TestResult {
  const data = record(value);
  return {
    testId: string(data.testId),
    status: string(data.status),
    input: data.input,
    expectedOutput: data.expectedOutput,
    actualOutput: data.actualOutput,
  };
}

async function authenticated(send: (token: string) => Promise<unknown>) {
  const token = session.getAccessToken();
  if (!token) throw new ApiError('SESSION_REJECTED', 401);
  try {
    return await send(token);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      session.getAccessToken() === token
    ) {
      session.logout();
    }
    throw error;
  }
}

function get(path: string, signal: AbortSignal) {
  return authenticated((token) => getJson(path, token, signal));
}

function post(
  path: string,
  body: unknown,
  signal: AbortSignal,
  timeout?: number,
) {
  return authenticated((token) => postJson(path, body, signal, timeout, token));
}

async function runWorkspace(
  path: string,
  snapshot: RunSnapshot,
  signal: AbortSignal,
): Promise<RunResult> {
  const data = record(
    await post(path, { ...snapshot, language: 'JAVA' }, signal, 70000),
  );
  if (data.taskVersionId !== snapshot.taskVersionId) return invalidResponse();
  const result = record(data.result);
  return {
    status: string(result.status),
    passedTests: number(result.passedTests),
    totalTests: number(result.totalTests),
    testResults: array(result.testResults, testResult),
    compileOutput: null,
  };
}

const practicePath = '/tasks/practice/sum';

export const practiceApi = {
  async workspace(signal: AbortSignal) {
    return workspace(await get(practicePath + '/workspace', signal));
  },
  run(snapshot: RunSnapshot, signal: AbortSignal) {
    return runWorkspace(practicePath + '/run', snapshot, signal);
  },
};

export const lobbyApi = {
  async list(signal: AbortSignal) {
    return array(await get('/lobbies', signal), lobbySummary);
  },
  async createTask(input: JavaTaskInput, signal: AbortSignal) {
    return number(record(await post('/tasks', input, signal)).id);
  },
  async createLobby(
    settings: LobbySettings,
    taskId: number,
    signal: AbortSignal,
  ) {
    const data = await post(
      '/lobbies',
      { ...settings, taskIds: [taskId], allowedLanguages: ['JAVA'] },
      signal,
    );
    return number(record(data).id);
  },
  async join(code: string, signal: AbortSignal) {
    return lobby(
      await post('/lobbies/join', { code: code.trim().toUpperCase() }, signal),
    );
  },
  async details(id: number, signal: AbortSignal) {
    return lobby(await get('/lobbies/' + id, signal));
  },
  async changeStatus(
    id: number,
    action: 'start' | 'finish',
    signal: AbortSignal,
  ) {
    return lobby(await post('/lobbies/' + id + '/' + action, {}, signal));
  },
  async workspace(lobbyId: number, taskId: number, signal: AbortSignal) {
    return workspace(
      await post(
        '/lobbies/' + lobbyId + '/tasks/' + taskId + '/workspace?language=JAVA',
        undefined,
        signal,
      ),
    );
  },
  run(
    lobbyId: number,
    taskId: number,
    snapshot: RunSnapshot,
    signal: AbortSignal,
  ) {
    return runWorkspace(
      '/lobbies/' + lobbyId + '/tasks/' + taskId + '/run',
      snapshot,
      signal,
    );
  },
  async submitSolution(
    lobbyId: number,
    taskId: number,
    snapshot: RunSnapshot,
    signal: AbortSignal,
  ) {
    return submission(
      await post(
        `/lobbies/${lobbyId}/tasks/${taskId}/submission`,
        { ...snapshot, language: 'JAVA' },
        signal,
      ),
    );
  },
  async submissions(lobbyId: number, signal: AbortSignal) {
    return array(
      await get(`/lobbies/${lobbyId}/submissions`, signal),
      submission,
    );
  },
  async submissionReview(
    lobbyId: number,
    submissionId: number,
    signal: AbortSignal,
  ) {
    const data = record(
      await get(submissionPath(lobbyId, submissionId) + '/review', signal),
    );
    return {
      files: array(data.files, (value) => {
        const file = record(value);
        return { path: string(file.path), content: string(file.content) };
      }),
      publicEvaluation:
        data.publicEvaluation == null
          ? null
          : submissionEvaluation(data.publicEvaluation),
    };
  },
  async evaluateSubmission(
    lobbyId: number,
    submissionId: number,
    signal: AbortSignal,
  ) {
    return submissionEvaluation(
      await post(
        submissionPath(lobbyId, submissionId) + '/evaluation',
        undefined,
        signal,
        70000,
      ),
    );
  },
};

export function positiveId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const errorLabels: Record<string, string> = {
  TIMEOUT: 'Serwer nie odpowiedział na czas. Operacja może nadal trwać.',
  RUNNER_TIMEOUT: 'Przekroczono czas oczekiwania. Testy mogą nadal trwać.',
  NETWORK_ERROR: 'Nie można połączyć się z backendem.',
  RUNNER_UNAVAILABLE: 'Runner jest chwilowo niedostępny. Spróbuj ponownie.',
  RUNNER_INVALID_RESPONSE: 'Runner zwrócił nieprawidłowy wynik.',
  PUBLIC_TESTS_NOT_CONFIGURED:
    'To zadanie nie ma skonfigurowanych testów jawnych.',
  TASK_VERSION_MISMATCH:
    'Zadanie zostało zaktualizowane. Odśwież stronę przed ponownym uruchomieniem testów.',
  LOBBY_FULL: 'W lobby zabrakło wolnych miejsc.',
  LOBBY_NOT_FOUND: 'Nie znaleziono lobby o tym kodzie.',
  LOBBY_NOT_ACTIVE: 'Sesja nie jest aktywna.',
  LOBBY_NOT_WAITING: 'Poczekalnia jest już zamknięta.',
  LOBBY_NOT_FINISHED: 'Rozwiązania będą dostępne po zakończeniu sesji.',
  LOBBY_PARTICIPANT_REQUIRED: 'Rozwiązanie może oddać tylko uczestnik lobby.',
  TASK_ALREADY_SUBMITTED: 'To rozwiązanie zostało już oddane.',
  INCOMPLETE_SUBMISSION:
    'Aby oddać rozwiązanie, prześlij wszystkie edytowalne pliki.',
  INVALID_RUN_FILES: 'Sprawdź ścieżki i rozmiary plików rozwiązania.',
  SUBMISSION_NOT_FOUND: 'Nie znaleziono rozwiązania w tym lobby.',
  LOBBY_ACCESS_DENIED: 'Dołącz do lobby, aby je otworzyć.',
  SESSION_REJECTED: 'Sesja wygasła. Zaloguj się ponownie.',
  INVALID_RESPONSE: 'Serwer zwrócił odpowiedź w nieoczekiwanym formacie.',
};

export function lobbyError(error: unknown) {
  if (!(error instanceof ApiError)) return 'Nie udało się wykonać operacji.';
  return (
    errorLabels[error.code] ??
    (error.message === error.code
      ? 'Nie udało się wykonać operacji.'
      : error.message)
  );
}
