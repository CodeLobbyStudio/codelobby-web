import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '../src/app/App';

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('application routing', () => {
  it('opens the home page and navigates to login, registration and profile', async () => {
    const user = userEvent.setup();
    renderRoute('/');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Jedno lobby. Wiele rozwiązań.',
      }),
    ).toBeInTheDocument();

    for (const name of ['Logowanie', 'Rejestracja', 'Profil']) {
      await user.click(screen.getByRole('link', { name }));
      expect(
        screen.getByRole('heading', { level: 1, name }),
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
  });

  it.each([
    ['/login', 'Logowanie'],
    ['/register', 'Rejestracja'],
    ['/profile', 'Profil'],
  ])('opens %s directly', (path, title) => {
    renderRoute(path);
    expect(
      screen.getByRole('heading', { level: 1, name: title }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('shows 404 for unknown URLs and lets the user return home', async () => {
    const user = userEvent.setup();
    renderRoute('/nie-ma-takiej-strony');
    expect(
      screen.getByRole('heading', { name: 'Nie znaleziono strony' }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('link', { name: 'Wróć na stronę główną' }),
    );
    expect(
      screen.getByRole('heading', { name: 'Jedno lobby. Wiele rozwiązań.' }),
    ).toBeInTheDocument();
  });
});
