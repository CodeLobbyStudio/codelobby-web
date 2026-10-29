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

describe('static landing foundation', () => {
  it('renders the main sections and a noninteractive illustration', () => {
    renderRoute('/');
    expect(
      screen.getByRole('heading', { name: 'Koduj. Rywalizuj. Rozwijaj się.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Możliwości CodeLobby' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('list', { name: 'Etapy pracy w CodeLobby' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: /Ilustracja planowanego lobby/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Powiększ/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps every visible landing control disabled without navigation or requests', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const user = userEvent.setup();
      renderRoute('/');
      for (const button of screen.getAllByRole('button')) {
        expect(button).toBeDisabled();
        await user.click(button);
      }
      expect(
        screen.getByRole('heading', { name: /Koduj/, level: 1 }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveAttribute('href', '#main');
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('provides static navigation labels and account-entry controls', () => {
    renderRoute('/');
    const nav = within(
      screen.getByRole('navigation', { name: 'Nawigacja główna' }),
    );
    for (const name of ['Zadania', 'Lobby', 'Ranking', 'Dla prowadzących']) {
      expect(nav.getByRole('button', { name })).toBeDisabled();
    }
    for (const name of ['Zaloguj się', 'Załóż konto']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });
});

describe('existing route skeleton', () => {
  it.each([
    ['/login', 'Logowanie'],
    ['/register', 'Rejestracja'],
    ['/profile', 'Profil'],
  ])(
    'retains the direct %s placeholder from the routing skeleton',
    (path, title) => {
      renderRoute(path);
      expect(
        screen.getByRole('heading', { name: title, level: 1 }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(document.title).toBe(`${title} — CodeLobby`);
    },
  );
  it('retains the 404 fallback and recovery', async () => {
    renderRoute('/unknown');
    expect(
      screen.getByRole('heading', { name: 'Nie znaleziono strony' }),
    ).toBeInTheDocument();
    await userEvent
      .setup()
      .click(screen.getByRole('link', { name: 'Wróć na stronę główną' }));
    expect(
      screen.getByRole('heading', { name: /Koduj/, level: 1 }),
    ).toBeInTheDocument();
  });
});
