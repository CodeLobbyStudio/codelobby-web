import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
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
      const navigation = within(
        screen.getByRole('navigation', { name: 'Nawigacja główna' }),
      );
      await user.click(navigation.getByRole('link', { name }));
      expect(
        screen.getByRole('heading', { level: 1, name }),
      ).toBeInTheDocument();
      expect(navigation.getByRole('link', { name })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(document.title).toBe(`${name} — CodeLobby`);
      expect(screen.getByRole('main')).toHaveFocus();
    }
  });

  it('keeps future task and lobby routes unavailable', () => {
    renderRoute('/tasks');
    expect(
      screen.getByRole('heading', { name: 'Nie znaleziono strony' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Zadania' }),
    ).not.toBeInTheDocument();
  });

  it('does not request API data while navigating through presentation-only pages', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const user = userEvent.setup();
      renderRoute('/');
      for (const name of ['Logowanie', 'Rejestracja', 'Profil']) {
        await user.click(
          within(
            screen.getByRole('navigation', { name: 'Nawigacja główna' }),
          ).getByRole('link', { name }),
        );
      }
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('makes the account placeholder explicit without displaying user data', () => {
    renderRoute('/profile');
    expect(screen.getByText('Podgląd części konta')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Nawigacja konta' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Wyloguj' }),
    ).not.toBeInTheDocument();
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
