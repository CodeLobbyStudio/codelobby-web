import { afterEach, expect, it, vi } from 'vitest';
import { session } from '../src/features/auth/session';
import { javaExample } from '../src/features/lobby/javaExample';
import { lobbyApi } from '../src/features/lobby/lobbyApi';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });

it('uses the authenticated Java task, lobby and Run wire contracts', async () => {
  const lobby = {
    id: 18,
    name: 'Java',
    joinCode: 'ABCD1234',
    status: 'WAITING',
    role: 'PARTICIPANT',
    maxParticipants: 2,
    durationMinutes: 30,
    endsAt: null,
    allowedLanguages: ['JAVA'],
    members: [{ userId: 3, role: 'PARTICIPANT' }],
    tasks: [{ taskId: 7, title: javaExample.title, position: 0 }],
  };
  vi.spyOn(session, 'getAccessToken').mockReturnValue('test-token');
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  fetch
    .mockResolvedValueOnce(json({ id: 7 }, 201))
    .mockResolvedValueOnce(json({ id: 18 }, 201))
    .mockResolvedValueOnce(json(lobby))
    .mockResolvedValueOnce(json({ ...lobby, status: 'ACTIVE', role: 'HOST' }))
    .mockResolvedValueOnce(
      json({
        language: 'JAVA',
        taskVersionId: 'version-1',
        title: javaExample.title,
        description: javaExample.description,
        files: [
          { path: 'src/Solution.java', type: 'EDITABLE', content: 'starter' },
          { path: 'src/Helpers.java', type: 'READ_ONLY', content: 'helper' },
        ],
        publicTests: [{ testId: 'public-1' }],
      }),
    )
    .mockResolvedValueOnce(
      json({
        taskVersionId: 'version-1',
        result: {
          status: 'WRONG_ANSWER',
          passedTests: 0,
          totalTests: 1,
          testResults: [
            {
              testId: 'public-1',
              status: 'WRONG_ANSWER',
              input: { text: 'codelobby' },
              expectedOutput: 3,
              actualOutput: 0,
            },
          ],
        },
      }),
    );
  const { signal } = new AbortController();
  const settings = { name: 'Java', maxParticipants: 2, durationMinutes: 30 };
  const taskId = await lobbyApi.createTask(javaExample, signal);
  const lobbyId = await lobbyApi.createLobby(settings, taskId, signal);
  expect(await lobbyApi.join(' abcd1234 ', signal)).toEqual({
    ...lobby,
    tasks: lobby.tasks.map((task) => ({ ...task, submitted: false })),
  });
  const started = await lobbyApi.changeStatus(lobbyId, 'start', signal);
  expect(started.status).toBe('ACTIVE');
  const workspace = await lobbyApi.workspace(lobbyId, taskId, signal);
  expect(workspace.files.map(({ role }) => role)).toEqual([
    'EDITABLE',
    'READ_ONLY',
  ]);
  const snapshot = {
    taskVersionId: workspace.taskVersionId,
    files: [{ path: 'src/Solution.java', content: 'modified' }],
  };
  const result = await lobbyApi.run(lobbyId, taskId, snapshot, signal);
  expect(result.status).toBe('WRONG_ANSWER');
  expect(result.testResults[0]).toMatchObject({
    testId: 'public-1',
    expectedOutput: 3,
    actualOutput: 0,
  });

  expect(fetch.mock.calls.map(([url]) => url)).toEqual([
    '/api/tasks',
    '/api/lobbies',
    '/api/lobbies/join',
    '/api/lobbies/18/start',
    '/api/lobbies/18/tasks/7/workspace?language=JAVA',
    '/api/lobbies/18/tasks/7/run',
  ]);
  for (const [, options] of fetch.mock.calls) {
    expect(options.headers.Authorization).toBe('Bearer test-token');
  }
  expect(JSON.parse(fetch.mock.calls[0][1].body)).toEqual(javaExample);
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
    ...settings,
    taskIds: [7],
    allowedLanguages: ['JAVA'],
  });
  expect(JSON.parse(fetch.mock.calls[2][1].body)).toEqual({ code: 'ABCD1234' });
  expect(fetch.mock.calls[4][1].method).toBe('POST');
  expect(JSON.parse(fetch.mock.calls[5][1].body)).toEqual({
    ...snapshot,
    language: 'JAVA',
  });
});
