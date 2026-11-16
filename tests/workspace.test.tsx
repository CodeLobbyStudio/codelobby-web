import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import WorkspacePreview from '../src/features/workspace/WorkspacePreview';
import { demoTask } from '../src/features/workspace/demoTask';
import { simulateRun } from '../src/features/workspace/demoRun';
import { RunResults } from '../src/features/workspace/RunResults';

vi.mock('../src/features/workspace/JavaEditor', () => ({
  JavaEditor: ({
    file,
    content,
    onChange,
  }: {
    file: (typeof demoTask.files)[number];
    content: string;
    onChange: (path: string, content: string) => void;
  }) => (
    <textarea
      aria-label={file.path}
      value={content}
      readOnly={file.role === 'READ_ONLY'}
      onChange={(event) => onChange(file.path, event.target.value)}
    />
  ),
}));

afterEach(() => vi.useRealTimers());

it('captures every editable file, blocks a second run and flags edits made while waiting', () => {
  vi.useFakeTimers();
  const run = vi.fn(simulateRun);
  render(
    <MemoryRouter>
      <WorkspacePreview run={run} />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'solution' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Accumulator.java' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'helper' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Symuluj Run' }));
  const pending = screen.getByRole('button', { name: 'Symulacja w toku…' });
  expect(pending).toBeDisabled();
  fireEvent.click(pending);
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'new helper' },
  });

  act(() => vi.advanceTimersByTime(450));
  expect(run).toHaveBeenCalledExactlyOnceWith(
    {
      taskVersionId: demoTask.versionId,
      files: [
        { path: 'src/Solution.java', content: 'solution' },
        { path: 'src/Accumulator.java', content: 'helper' },
      ],
    },
    'accepted',
  );
  expect(
    screen.getByText('Wynik dotyczy poprzedniej treści plików.'),
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Symuluj Run' })).toBeEnabled();
});

it('maps case names by ID and displays numeric zero while omitting null diagnostics', () => {
  render(
    <RunResults
      tests={demoTask.tests}
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

it('preserves both editable buffers while opening and leaving a read-only file', () => {
  render(
    <MemoryRouter>
      <WorkspacePreview />
    </MemoryRouter>,
  );

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'updated solution' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Accumulator.java' }));
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'updated helper' },
  });
  fireEvent.click(screen.getByRole('button', { name: /Example\.java/ }));
  expect(screen.getByRole('textbox')).toHaveAttribute('readonly');

  fireEvent.click(screen.getByRole('button', { name: 'Solution.java' }));
  expect(screen.getByRole('textbox')).toHaveValue('updated solution');
  fireEvent.click(screen.getByRole('button', { name: 'Accumulator.java' }));
  expect(screen.getByRole('textbox')).toHaveValue('updated helper');
});

it.each([
  ['accepted', 'Wszystkie testy zaliczone', '2 / 2 zaliczone'],
  ['wrongAnswer', 'Błędny wynik', '1 / 2 zaliczone'],
  ['compilationError', 'Błąd kompilacji', '0 / 2 zaliczone'],
  ['timeLimit', 'Przekroczony limit czasu', '0 / 2 zaliczone'],
] as const)('shows the %s verdict and count', (scenario, verdict, count) => {
  const outcome = simulateRun(
    { taskVersionId: demoTask.versionId, files: [] },
    scenario,
  );
  render(<RunResults outcome={outcome} tests={demoTask.tests} stale={false} />);
  expect(screen.getByRole('status')).toHaveTextContent(verdict);
  expect(screen.getByRole('status')).toHaveTextContent(count);
});

it.each([
  ['unavailable', /chwilowo niedostępna/, true],
  ['timeout', /Wykonanie może nadal trwać/, false],
] as const)(
  'shows %s and only suggests retry when marked retryable',
  (scenario, message, retryable) => {
    const outcome = simulateRun(
      { taskVersionId: demoTask.versionId, files: [] },
      scenario,
    );
    render(
      <RunResults outcome={outcome} tests={demoTask.tests} stale={false} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    const retry = screen.queryByText('Możesz ponowić próbę ręcznie.');
    if (retryable) expect(retry).toBeVisible();
    else expect(retry).not.toBeInTheDocument();
  },
);
