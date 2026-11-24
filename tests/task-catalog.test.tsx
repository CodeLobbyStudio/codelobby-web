import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import TaskCatalogPreview from '../src/features/tasks/TaskCatalogPreview';

function openCatalog(search = '') {
  render(
    <MemoryRouter initialEntries={['/dev/tasks' + search]}>
      <TaskCatalogPreview />
    </MemoryRouter>,
  );
}

it.each(['42', 'binary'])('finds the same official task by %s', (query) => {
  openCatalog();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Numer lub nazwa' }), {
    target: { value: query },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Szukaj' }));

  expect(screen.getByRole('heading', { name: /Binary search/ })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('1 wynik');
});

it('combines URL filters, shows empty results and resets the filters', () => {
  openCatalog('?query=binary&difficulty=HARD&tag=graphs');
  expect(
    screen.getByRole('heading', { name: 'Brak pasujących zadań' }),
  ).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Wyczyść filtry' }));

  expect(screen.getByRole('searchbox')).toHaveValue('');
  expect(screen.getByRole('status')).toHaveTextContent('8 wyników');
  fireEvent.click(screen.getByRole('link', { name: 'Następna' }));
  expect(screen.getByText('Strona 2 z 2')).toBeVisible();
  expect(
    screen.getByRole('heading', { name: /Scalanie przedziałów/ }),
  ).toBeVisible();
});

it('shows sample private tasks separately from the official catalog', () => {
  openCatalog();
  fireEvent.click(screen.getByRole('link', { name: 'Moje zadania' }));
  expect(
    screen.getByRole('heading', { name: 'Liczba unikalnych słów' }),
  ).toBeVisible();
  expect(
    screen.queryByRole('heading', { name: /Binary search/ }),
  ).not.toBeInTheDocument();
});
