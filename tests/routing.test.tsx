import { act, render, screen, within } from '@testing-library/react';
import { StrictMode } from 'react';
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
  it('ignores saved section navigation on reload but still handles the next click', async () => {
    render(
      <StrictMode>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/',
              key: 'saved-entry',
              state: { section: 'jak-to-dziala', navigationItem: 'Lobby' },
            },
          ]}
        >
          <App />
        </MemoryRouter>
      </StrictMode>,
    );
    const lobby = screen.getByRole('link', { name: 'Lobby' });
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      behavior: 'instant',
    });
    expect(window.history.scrollRestoration).toBe('manual');
    expect(screen.getByRole('main')).toHaveFocus();
    expect(lobby).not.toHaveAttribute('aria-current');
    expect(document.getElementById('jak-to-dziala')).not.toHaveFocus();
    await userEvent.setup().click(lobby);
    expect(document.getElementById('jak-to-dziala')).toHaveFocus();
    expect(lobby).toHaveAttribute('aria-current', 'location');
  });

  it('clears the selected navigation highlight when its section leaves the viewport', async () => {
    let notify: IntersectionObserverCallback | undefined;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    try {
      renderRoute('/');
      const lobby = screen.getByRole('link', { name: 'Lobby' });
      await userEvent.setup().click(lobby);
      act(() =>
        notify?.(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      );
      expect(lobby).not.toHaveAttribute('aria-current');
      act(() =>
        notify?.(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        ),
      );
      expect(lobby).toHaveAttribute('aria-current', 'location');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('shows section links without a menu toggle', () => {
    renderRoute('/');
    expect(
      screen.queryByRole('button', { name: 'Menu' }),
    ).not.toBeInTheDocument();
    expect(
      within(
        screen.getByRole('navigation', { name: 'Nawigacja główna' }),
      ).getAllByRole('link'),
    ).toHaveLength(4);
  });

  it('scrolls from login to landing sections without fragment links', async () => {
    const user = userEvent.setup();
    renderRoute('/login');
    for (const [name, section] of [
      ['Zadania', 'funkcje'],
      ['Lobby', 'jak-to-dziala'],
      ['Ranking', 'jak-to-dziala'],
      ['Dla prowadzących', 'dla-prowadzacych'],
    ]) {
      const link = within(
        screen.getByRole('navigation', { name: 'Nawigacja główna' }),
      ).getByRole('link', { name });
      expect(link).toHaveAttribute('href', '/');
      await user.click(link);
      expect(document.getElementById(section)).toHaveFocus();
      expect(link).toHaveAttribute('aria-current', 'location');
    }
  });

  it('lets visitors leave the account placeholder directly', async () => {
    const user = userEvent.setup();
    renderRoute('/login');
    await user.click(
      screen.getByRole('link', { name: '← Wróć na stronę główną' }),
    );
    expect(
      screen.getByRole('heading', { level: 1, name: /Koduj/ }),
    ).toBeInTheDocument();
  });

  it('opens the team landing page and navigates to account entry pages', async () => {
    const user = userEvent.setup();
    renderRoute('/');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Koduj. Rywalizuj. Rozwijaj się.',
      }),
    ).toBeInTheDocument();
    for (const [label, title] of [
      ['Zaloguj się', 'Logowanie'],
      ['Załóż konto', 'Rejestracja'],
    ]) {
      const header = within(screen.getByRole('banner'));
      await user.click(header.getByRole('link', { name: label }));
      expect(
        screen.getByRole('heading', { level: 1, name: title }),
      ).toBeInTheDocument();
      expect(header.getByRole('link', { name: label })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(document.title).toBe(`${title} — CodeLobby`);
      expect(screen.getByRole('main')).toHaveFocus();
    }
  });

  it('keeps section links on the landing route instead of inventing task routes', () => {
    renderRoute('/tasks');
    expect(
      screen.getByRole('heading', { name: 'Nie znaleziono strony' }),
    ).toBeInTheDocument();
    const nav = within(
      screen.getByRole('navigation', { name: 'Nawigacja główna' }),
    );
    expect(nav.getByRole('link', { name: 'Zadania' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(nav.getByRole('link', { name: 'Lobby' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('does not request API data while navigating through presentation-only pages', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const user = userEvent.setup();
      renderRoute('/');
      for (const name of ['Zaloguj się', 'Załóż konto']) {
        await user.click(
          within(screen.getByRole('banner')).getByRole('link', { name }),
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
    if (path !== '/profile')
      expect(
        screen.getByRole('textbox', { name: 'Email' }),
      ).toBeInTheDocument();
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
      screen.getByRole('heading', { level: 1, name: /Koduj/ }),
    ).toBeInTheDocument();
  });

  it('explains the unavailable lobby actions without making API calls', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const user = userEvent.setup();
      renderRoute('/');
      await user.click(screen.getByRole('button', { name: 'Utwórz lobby' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Tworzenie lobby będzie dostępne w kolejnym etapie.',
      );
      await user.click(screen.getByRole('button', { name: 'Dołącz kodem' }));
      expect(screen.getByRole('status')).toHaveTextContent(
        'Dołączanie kodem będzie dostępne w kolejnym etapie.',
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('exposes the editor as an illustration without fake interactive controls', () => {
    renderRoute('/');
    expect(
      screen.getByRole('img', { name: /Ilustracja planowanego lobby/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Uruchom' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Wyślij' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Powiadomienia — w przygotowaniu' }),
    ).not.toBeInTheDocument();
  });

  it('keeps footer placeholders local instead of inventing legal or social links', async () => {
    renderRoute('/');
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Polityka prywatności' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'dokument będzie dostępny',
    );
    expect(
      screen.queryByRole('link', { name: /GitHub/ }),
    ).not.toBeInTheDocument();
  });
});
