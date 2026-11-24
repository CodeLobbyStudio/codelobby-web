import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { session } from '../src/features/auth/session';
import CreateLobbyPage from '../src/features/lobby/CreateLobbyPage';
import { JoinLobbyPage } from '../src/features/lobby/JoinLobbyPage';
import { LobbyPage } from '../src/features/lobby/LobbyPage';
import LobbyWorkspacePage from '../src/features/lobby/LobbyWorkspacePage';
import { MyLobbiesPage } from '../src/features/lobby/MyLobbiesPage';

vi.mock('../src/features/workspace/JavaEditor', () => ({
  JavaEditor: ({
    file,
    files,
    content,
    onChange,
  }: {
    file?: { path: string; role: string };
    files?: { path: string; content: string }[];
    content?: string;
    onChange: (path: string, content: string) => void;
  }) =>
    file && (
      <textarea
        key={file.path}
        aria-label={file.path}
        aria-readonly={file.role === 'READ_ONLY' || undefined}
        readOnly={file.role === 'READ_ONLY'}
        defaultValue={files?.find(({ path }) => path === file.path)?.content}
        value={content}
        onChange={(event) => onChange(file.path, event.target.value)}
      />
    ),
}));

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
        <Route path="/lobbies" element={<MyLobbiesPage />} />
        <Route path="/lobbies/new" element={<CreateLobbyPage />} />
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
  expect(screen.queryByRole('table')).not.toBeInTheDocument();
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
    await screen.findByRole('link', { name: /Policz samogłoski/ }),
  ).toHaveAttribute('href', '/lobbies/17/tasks/8');
  expect(fetch).toHaveBeenCalledWith(
    '/api/lobbies/17/start',
    expect.objectContaining({ method: 'POST' }),
  );
});

it('shows the host the participant ID and the status of each numbered task below the task list', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockImplementation(() =>
      Promise.resolve(
        json({
          ...waiting,
          role: 'HOST',
          status: 'ACTIVE',
          members: [...waiting.members, { userId: 37, role: 'PARTICIPANT' }],
          tasks: [
            ...waiting.tasks,
            { taskId: 19, title: 'Zsumuj liczby', position: 1 },
            { taskId: 12, title: 'Odwróć napis', position: 2 },
          ],
          participantProgress: [
            {
              userId: 37,
              emailId: '283939',
              tasks: { 8: 'SUBMITTED', 19: 'OPENED' },
            },
          ],
        }),
      ),
    ),
  );

  setup('/lobbies/17');
  const table = await screen.findByRole('table');
  const tasks = screen.getByRole('heading', { name: 'Zadania' });
  expect(
    tasks.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(
    within(table)
      .getAllByRole('columnheader')
      .map((header) => header.textContent),
  ).toEqual(['ID', 'Uczestnik', 'Zad. 1', 'Zad. 2', 'Zad. 3']);
  const row = within(table).getByRole('row', { name: /283939 Uczestnik #37/ });
  expect(
    within(row)
      .getAllByRole('img')
      .map((dot) => dot.getAttribute('aria-label')),
  ).toEqual(['Wysłano', 'Otwarto', 'Nie otwarto']);
  expect(within(table).queryByText('Prowadzący #1')).not.toBeInTheDocument();
});

it('accepts a full invitation link in the join form', async () => {
  const fetch = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(json({ ...waiting, role: 'PARTICIPANT' })),
    );
  vi.stubGlobal('fetch', fetch);
  setup('/lobbies/join');
  const user = userEvent.setup();
  await user.type(
    screen.getByLabelText('Kod zaproszenia'),
    'http://localhost:5173/lobbies/join?code=abcd1234',
  );
  await user.click(screen.getByRole('button', { name: 'Dołącz' }));
  expect(await screen.findByRole('heading', { name: 'Java' })).toBeVisible();
  expect(fetch).toHaveBeenCalledWith(
    '/api/lobbies/join',
    expect.objectContaining({ body: '{"code":"ABCD1234"}' }),
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
          { path: 'src/Solution.java', type: 'EDITABLE', content: 'solution' },
          {
            path: 'src/tools/Helpers.java',
            type: 'READ_ONLY',
            content: 'helper',
          },
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
  const folderToggle = await screen.findByText('tools');
  await userEvent.click(folderToggle);
  expect(folderToggle.closest('details')).not.toHaveAttribute('open');
  await userEvent.click(folderToggle);
  await userEvent.click(
    await screen.findByRole('button', { name: /Helpers\.java/ }),
  );
  expect(screen.getByRole('tab', { name: 'Helpers.java' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(
    await screen.findByRole('textbox', { name: 'src/tools/Helpers.java' }),
  ).toHaveAttribute('aria-readonly', 'true');

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
          files: [{ path: 'src/Solution.java', content: 'solution' }],
          language: 'JAVA',
        }),
      }),
    ),
  );
});

it('imports Java sources with project paths and sends their contents when creating the task', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(json({ id: 8 }, 201))
    .mockResolvedValueOnce(json({ id: 17 }, 201));
  vi.stubGlobal('fetch', fetch);
  setup('/lobbies/new');

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Zacznij od zera' }));
  const solution = 'package demo;\nclass Solution {}';
  const tests = 'package demo;\nclass PublicTests {}';
  await user.upload(screen.getByLabelText('Pliki Java do importu'), [
    new File([solution], 'Solution.java'),
    new File([tests], 'PublicTests.java'),
  ]);
  expect(await screen.findByRole('status')).toHaveTextContent(
    'Import zakończony (2).',
  );
  expect(screen.getByLabelText('Klasa uruchamiająca testy')).toHaveValue(
    'demo.PublicTests',
  );
  expect(screen.getByText('src')).toBeVisible();
  expect(screen.getByText('tests')).toBeVisible();
  expect(
    screen.getByRole('textbox', { name: 'src/demo/Solution.java' }),
  ).toHaveTextContent('class Solution {}');
  const updatedSolution = 'package demo;\npublic class Solution {}';
  await user.upload(
    screen.getByLabelText('Pliki Java do importu'),
    new File([updatedSolution], 'Solution.java'),
  );
  await screen.findByText('Import zakończony (1).');
  expect(
    screen.getByRole('textbox', { name: 'src/demo/Solution.java' }),
  ).toHaveTextContent('public class Solution {}');
  await user.click(screen.getByRole('button', { name: /PublicTests\.java/ }));
  expect(
    screen.getByRole('textbox', { name: 'tests/demo/PublicTests.java' }),
  ).toHaveTextContent('class PublicTests {}');
  await user.type(screen.getByLabelText('Nazwa lobby'), 'Demo');
  await user.type(screen.getByLabelText('Tytuł'), 'Java');
  await user.type(screen.getByLabelText('Opis'), 'Zadanie testowe');
  await user.type(screen.getByLabelText('Identyfikatory testów'), 'public-1');
  await user.click(screen.getByRole('button', { name: 'Utwórz lobby' }));

  expect(fetch.mock.calls[0][0]).toBe('/api/tasks');
  expect(JSON.parse(fetch.mock.calls[0][1].body).languages[0]).toEqual({
    language: 'JAVA',
    files: [
      {
        path: 'src/demo/Solution.java',
        type: 'EDITABLE',
        content: updatedSolution,
      },
      {
        path: 'tests/demo/PublicTests.java',
        type: 'VISIBLE_TEST',
        content: tests,
      },
    ],
    javaPublicTests: { mainClass: 'demo.PublicTests', testIds: ['public-1'] },
  });
});

it('opens an existing hosted lobby from the account list', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(json([{ ...waiting, role: 'HOST' }]))
    .mockResolvedValue(json({ ...waiting, role: 'HOST' }));
  vi.stubGlobal('fetch', fetch);
  setup('/lobbies');
  await userEvent.click(
    await screen.findByRole('link', { name: /Java.*Prowadzący/ }),
  );
  expect(await screen.findByRole('heading', { name: 'Java' })).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Rozpocznij sesję' }),
  ).toBeVisible();
});
