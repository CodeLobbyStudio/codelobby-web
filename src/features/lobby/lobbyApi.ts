import { session } from '../auth/session';
import { ApiError, getJson, isRecord, postJson } from '../../shared/api/http';
import type { RunSnapshot, TestResult } from '../workspace/runTypes';

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
type LobbyTask = { taskId: number; title: string; position: number };

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
  tests: { id: string; title: string }[];
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

function lobby(value: unknown): Lobby {
  const data = record(value);
  return {
    id: number(data.id),
    name: string(data.name),
    joinCode: string(data.joinCode),
    status: status(data.status),
    role: role(data.role),
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
      };
    }),
  };
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
    tests: array(data.publicTests, (value) => {
      const id = string(record(value).testId);
      return { id, title: id };
    }),
  };
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

export const lobbyApi = {
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
      await get(
        '/lobbies/' + lobbyId + '/tasks/' + taskId + '/workspace?language=JAVA',
        signal,
      ),
    );
  },
  async run(
    lobbyId: number,
    taskId: number,
    snapshot: RunSnapshot,
    signal: AbortSignal,
  ) {
    const data = record(
      await post(
        '/lobbies/' + lobbyId + '/tasks/' + taskId + '/run',
        { ...snapshot, language: 'JAVA' },
        signal,
        70000,
      ),
    );
    if (data.taskVersionId !== snapshot.taskVersionId) {
      return invalidResponse();
    }
    const result = record(data.result);
    return {
      status: string(result.status),
      passedTests: number(result.passedTests),
      totalTests: number(result.totalTests),
      testResults: array(result.testResults, testResult),
      compileOutput: null,
    };
  },
};

export function positiveId(value: string | undefined) {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const errorLabels: Record<string, string> = {
  TIMEOUT: 'Serwer nie odpowiedział na czas. Możesz ponowić próbę ręcznie.',
  RUNNER_TIMEOUT: 'Przekroczono czas oczekiwania na Runnera.',
  RUN_TIMEOUT: 'Przekroczono czas oczekiwania na Runnera.',
  NETWORK_ERROR: 'Nie można połączyć się z backendem.',
  RUNNER_UNAVAILABLE: 'Runner jest chwilowo niedostępny. Spróbuj ponownie.',
  RUNNER_INVALID_RESPONSE: 'Runner zwrócił nieprawidłowy wynik.',
  LOBBY_FULL: 'W lobby zabrakło wolnych miejsc.',
  LOBBY_NOT_FOUND: 'Nie znaleziono lobby o tym kodzie.',
  LOBBY_NOT_ACTIVE: 'Sesja nie jest aktywna.',
  LOBBY_NOT_WAITING: 'Poczekalnia jest już zamknięta.',
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
