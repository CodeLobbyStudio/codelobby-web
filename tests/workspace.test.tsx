import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { session } from '../src/features/auth/session';
import PracticeWorkspacePage from '../src/features/workspace/PracticeWorkspacePage';
import { RunResults } from '../src/features/workspace/RunResults';
import { practiceWorkspace } from './fixtures/practiceWorkspace';

vi.mock('../src/features/workspace/JavaEditor', () => ({
  JavaEditor: ({
    file,
    files,
    onChange,
  }: {
    file?: (typeof practiceWorkspace.files)[number] & { role: string };
    files: { path: string; content: string }[];
    onChange: (path: string, content: string) => void;
  }) => {
    const [buffers, setBuffers] = useState<Record<string, string>>({});
    return (
      file && (
        <textarea
          aria-label={file.path}
          value={
            buffers[file.path] ??
            files.find(({ path }) => path === file.path)?.content
          }
          readOnly={file.role === 'READ_ONLY'}
          onChange={(event) => {
            const content = event.target.value;
            setBuffers((previous) => ({ ...previous, [file.path]: content }));
            onChange(file.path, content);
          }}
        />
      )
    );
  },
}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

const tests = practiceWorkspace.publicTests.map(({ testId, title }) => ({
  id: testId,
  title,
}));

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });

const accepted = {
  taskVersionId: practiceWorkspace.taskVersionId,
  result: {
    status: 'ACCEPTED',
    passedTests: 2,
    totalTests: 2,
    testResults: tests.map(({ id }) => ({ testId: id, status: 'ACCEPTED' })),
  },
};

async function openPractice(
  fetch = vi.fn().mockResolvedValueOnce(json(practiceWorkspace)),
) {
  vi.spyOn(session, 'getAccessToken').mockReturnValue('participant-token');
  vi.stubGlobal('fetch', fetch);
  render(
    <MemoryRouter>
      <PracticeWorkspacePage />
    </MemoryRouter>,
  );
  await screen.findByRole('textbox', { name: 'src/Solution.java' });
}

it('sends a real practice Run with the authenticated editable snapshot and marks subsequent edits', async () => {
  let respond!: (response: Response) => void;
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(json(practiceWorkspace))
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        respond = resolve;
      }),
    );
  await openPractice(fetch);

  expect(fetch).toHaveBeenCalledWith(
    '/api/tasks/practice/sum/workspace',
    expect.objectContaining({
      method: 'GET',
      headers: expect.objectContaining({
        Authorization: 'Bearer participant-token',
      }),
    }),
  );
  expect(screen.getByText('[1, 2, 3] → 6')).toBeVisible();
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'solution' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'src/Accumulator.java' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'helper change' },
  });
  fireEvent.keyDown(screen.getByRole('textbox'), {
    key: 'Enter',
    ctrlKey: true,
  });

  const pending = screen.getByRole('button', { name: 'Uruchamianie testów…' });
  expect(pending).toBeDisabled();
  fireEvent.click(pending);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'new helper' },
  });
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenLastCalledWith(
    '/api/tasks/practice/sum/run',
    expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer participant-token',
      }),
      body: JSON.stringify({
        taskVersionId: practiceWorkspace.taskVersionId,
        files: [
          { path: 'src/Solution.java', content: 'solution' },
          { path: 'src/Accumulator.java', content: 'helper change' },
        ],
        language: 'JAVA',
      }),
    }),
  );

  respond(json(accepted));
  expect(await screen.findByText('Wszystkie testy zaliczone')).toBeVisible();
  expect(
    screen.getByText('Wynik dotyczy poprzedniej treści plików.'),
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Run' })).toBeEnabled();
});

it('allows the participant to retry after the Runner is unavailable', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(json(practiceWorkspace))
    .mockResolvedValueOnce(json({ code: 'RUNNER_UNAVAILABLE' }, 503))
    .mockResolvedValueOnce(json(accepted));
  await openPractice(fetch);
  fireEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Runner jest chwilowo niedostępny.',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Run' }));
  expect(await screen.findByText('Wszystkie testy zaliczone')).toBeVisible();
  await waitFor(() =>
    expect(screen.queryByRole('alert')).not.toBeInTheDocument(),
  );
});

it('preserves both editable buffers while opening and leaving a read-only file', async () => {
  await openPractice();
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'updated solution' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'src/Accumulator.java' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'updated helper' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Example\.java/ }));
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly');
  fireEvent.click(screen.getByRole('tab', { name: 'Solution.java' }));
  expect(screen.getByRole('textbox')).toHaveValue('updated solution');
  fireEvent.click(screen.getByRole('tab', { name: 'Accumulator.java' }));
  expect(screen.getByRole('textbox')).toHaveValue('updated helper');
});

it('maps case names by ID and displays numeric zero while omitting null diagnostics', () => {
  render(
    <RunResults
      tests={tests}
      stale={false}
      outcome={{
        kind: 'result',
        result: {
          status: 'WRONG_ANSWER',
          passedTests: 0,
          totalTests: 2,
          compileOutput: null,
          testResults: [
            {
              testId: 'empty',
              status: 'WRONG_ANSWER',
              input: null,
              expectedOutput: 0,
              actualOutput: null,
            },
            {
              testId: 'positive',
              status: 'NOT_RUN',
              input: null,
              expectedOutput: null,
              actualOutput: null,
            },
          ],
        },
      }}
    />,
  );
  fireEvent.click(screen.getByText('Pusta tablica · Błędny wynik'));
  fireEvent.click(screen.getByText('Liczby dodatnie · Nie uruchomiono'));
  expect(screen.getByText('0', { exact: true })).toBeVisible();
  expect(screen.queryByText('Otrzymany wynik')).not.toBeInTheDocument();
  expect(
    screen.getByText('Szczegóły diagnostyczne są niedostępne.'),
  ).toBeVisible();
});

it.each([
  ['ACCEPTED', 'Wszystkie testy zaliczone', 2],
  ['WRONG_ANSWER', 'Błędny wynik', 1],
  ['COMPILATION_ERROR', 'Błąd kompilacji', 0],
  ['TIME_LIMIT_EXCEEDED', 'Przekroczony limit czasu', 0],
] as const)(
  'shows the %s verdict and count',
  (status, verdict, passedTests) => {
    render(
      <RunResults
        tests={tests}
        stale={false}
        outcome={{
          kind: 'result',
          result: {
            ...accepted.result,
            status,
            passedTests,
            testResults: [],
            compileOutput: null,
          },
        }}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(verdict);
    expect(screen.getByRole('status')).toHaveTextContent(
      `${passedTests} / 2 zaliczone`,
    );
  },
);

it.each([true, false])(
  'only suggests retry when marked retryable (%s)',
  (retryable) => {
    render(
      <RunResults
        outcome={{
          kind: 'error',
          code: 'TEST_ERROR',
          message: 'Nie udało się uruchomić testów.',
          retryable,
        }}
        tests={tests}
        stale={false}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nie udało się uruchomić testów.',
    );
    const retry = screen.queryByText('Możesz ponowić próbę ręcznie.');
    if (retryable) expect(retry).toBeVisible();
    else expect(retry).not.toBeInTheDocument();
  },
);
