import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { session } from '../src/features/auth/session';
import { JoinLobbyPage } from '../src/features/lobby/JoinLobbyPage';
import { LobbyPage } from '../src/features/lobby/LobbyPage';
import LobbyWorkspacePage from '../src/features/lobby/LobbyWorkspacePage';

const waiting = {
  id: 17,
  name: 'Java',
  joinCode: 'ABCD1234',
  status: 'WAITING',
  maxParticipants: 2,
  durationMinutes: 30,
  endsAt: null,
  allowedLanguages: ['JAVA'],
  members: [{ userId: 1, role: 'HOST' }],
  tasks: [{ taskId: 8, title: 'Policz samogłoski', position: 0 }],
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

function setup(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/lobbies/join" element={<JoinLobbyPage />} />
        <Route path="/lobbies/:lobbyId" element={<LobbyPage />} />
        <Route
          path="/lobbies/:lobbyId/tasks/:taskId"
          element={<LobbyWorkspacePage />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.spyOn(session, 'getAccessToken').mockReturnValue('participant-token');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it('reads the invite and retries after a full lobby error', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  fetch
    .mockResolvedValueOnce(json({ code: 'LOBBY_FULL' }, 409))
    .mockResolvedValueOnce(json({ ...waiting, role: 'PARTICIPANT' }))
    .mockResolvedValue(json({ ...waiting, role: 'PARTICIPANT' }));

  setup('/lobbies/join?code=ABCD1234');
  expect(screen.getByLabelText('Kod zaproszenia')).toHaveValue('ABCD1234');

  await userEvent.click(screen.getByRole('button', { name: 'Dołącz' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'W lobby zabrakło wolnych miejsc.',
  );

  await userEvent.click(screen.getByRole('button', { name: 'Dołącz' }));
  expect(await screen.findByRole('heading', { name: 'Java' })).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Rozpocznij sesję' }),
  ).not.toBeInTheDocument();
  expect(fetch).toHaveBeenCalledWith(
    '/api/lobbies/join',
    expect.objectContaining({ body: '{"code":"ABCD1234"}' }),
  );
});

it('lets the host start the session and open the task', async () => {
  const host = { ...waiting, role: 'HOST' };
  const active = { ...host, status: 'ACTIVE' };
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(json(host))
    .mockResolvedValueOnce(json(active))
    .mockResolvedValue(json(active));
  vi.stubGlobal('fetch', fetch);

  setup('/lobbies/17');
  await userEvent.click(
    await screen.findByRole('button', { name: 'Rozpocznij sesję' }),
  );

  expect(
    await screen.findByRole('link', { name: 'Policz samogłoski' }),
  ).toHaveAttribute('href', '/lobbies/17/tasks/8');
  expect(fetch).toHaveBeenCalledWith(
    '/api/lobbies/17/start',
    expect.objectContaining({ method: 'POST' }),
  );
});

it('sends editable files only and handles a Runner error and retry', async () => {
  const fetch = vi.fn();
  vi.stubGlobal('fetch', fetch);
  fetch
    .mockResolvedValueOnce(
      json({
        language: 'JAVA',
        taskVersionId: 'version-8',
        title: 'Policz samogłoski',
        description: 'Zaimplementuj metodę.',
        files: [
          { path: 'Solution.java', type: 'EDITABLE', content: 'solution' },
          { path: 'Helpers.java', type: 'READ_ONLY', content: 'helper' },
        ],
        publicTests: [{ testId: 'public-1' }],
      }),
    )
    .mockResolvedValueOnce(json({ code: 'RUNNER_UNAVAILABLE' }, 503))
    .mockResolvedValueOnce(
      json({
        taskVersionId: 'version-8',
        result: {
          status: 'ACCEPTED',
          passedTests: 1,
          totalTests: 1,
          testResults: [
            {
              testId: 'public-1',
              status: 'ACCEPTED',
              input: null,
              expectedOutput: null,
              actualOutput: null,
            },
          ],
        },
      }),
    );

  setup('/lobbies/17/tasks/8');
  await userEvent.click(
    await screen.findByRole('button', { name: /Helpers\.java/ }),
  );
  expect(await screen.findByLabelText('Helpers.java')).toHaveAttribute(
    'aria-readonly',
    'true',
  );

  await userEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Runner jest chwilowo niedostępny.',
  );
  await userEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(await screen.findByText('Wszystkie testy zaliczone')).toBeVisible();
  await waitFor(() =>
    expect(fetch).toHaveBeenLastCalledWith(
      '/api/lobbies/17/tasks/8/run',
      expect.objectContaining({
        body: JSON.stringify({
          taskVersionId: 'version-8',
          files: [{ path: 'Solution.java', content: 'solution' }],
          language: 'JAVA',
        }),
      }),
    ),
  );
});
