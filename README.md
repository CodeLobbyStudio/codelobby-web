# CodeLobby Web

Browser application for **CodeLobby**, a platform for collaborative live-coding labs and workshops.

## Planned features

- Create a lobby as **Host**, or join as a **Participant** with a code or link
- Configure tasks, enabled languages, starter code and tests as a Host
- Solve exercises in the browser code editor
- Submit solutions and view test results and execution feedback
- Display lobby participants, live progress and rankings

All users have the same account type. **Host** and **Participant** describe roles in a specific lobby, not separate account types.

## Development workflow

Use the **CodeLobby Development** GitHub Project, focused Issues, feature branches and reviewed Pull Requests targeting `main`.

## Local development

Requires **Node.js 24 LTS, version 24.15+** (recommended, see `.nvmrc`) or
Node.js 22.22.2+ within the 22.x line, and npm. These minimums cover the complete
toolchain, including the test DOM environment. Node 22.11 is too old.

In the `codelobby-web` directory, on Windows PowerShell:

```powershell
node --version
npm ci
Copy-Item .env.example .env
npm run dev
```

On macOS / Linux:

```sh
node --version
npm ci
cp .env.example .env
npm run dev
```

Open http://localhost:5173. Copy `.env.example` only on first setup; keep your
existing local configuration when updating. After pulling dependency changes,
run `npm ci` again. Use `npm install` when intentionally changing dependencies
and include the resulting `package-lock.json` in the change.

## Stack and commands

React + TypeScript (strict), Vite, React Router, ESLint, Prettier and Vitest with
Testing Library. Dependencies are pinned in `package.json` and `package-lock.json`.

| Command                | Purpose                                                         |
| ---------------------- | --------------------------------------------------------------- |
| `npm run dev`          | Local development with hot reload                               |
| `npm run build`        | Type-check application, tests and config, then build to `dist/` |
| `npm run preview`      | Preview the production build locally                            |
| `npm run lint`         | ESLint; warnings fail the check                                 |
| `npm run format`       | Format source and documentation                                 |
| `npm run format:check` | Check formatting without edits                                  |
| `npm test`             | Run routing, component and API configuration tests once         |
| `npm run test:watch`   | Run tests in watch mode                                         |

Run build, lint, format check and tests before opening a PR. Generated output,
dependencies and local environment files are excluded from Git.

### Continuous integration

`.github/workflows/ci.yml` runs on pull requests targeting `main` and pushes to
`main`. It uses Node from `.nvmrc` and runs `npm ci`, build, lint, formatting checks
and tests on Ubuntu. No running backend, database or repository secrets are needed.
The workflow only needs read access to repository contents.

Failed checks are visible on the PR. Enforcing successful checks before merging
requires a repository ruleset or branch protection configured by a maintainer.

## Routes and current scope

The application has a responsive landing page, a shared header/footer, a public
layout for `/login` and `/register`, an account layout for `/profile`, and a 404
page. Route changes update the document title and move keyboard focus to the
main content. A render error boundary keeps navigation available and provides a
safe fallback with retry.

Login, registration and profile content remain explicit placeholders: no forms,
session, user data or API requests are implemented yet. The account layout is
presentation only; `/profile` receives authentication protection in web #17.
The application runs without the backend.

Shared UI components include Button (disabled/loading), FormField (native input,
label, hint and validation feedback), Alert, LoadingIndicator, EmptyState and
ErrorState. Form controls are prepared for web #16 and are tested without adding
nonfunctional forms to the public interface. Alerts announce dynamic content only
when the caller explicitly opts in with `announce`; static notices do not interrupt
screen readers. ErrorState uses safe copy rather than raw exception messages.

Bootstrap work tracks [web #3](https://github.com/CodeLobbyStudio/codelobby-web/issues/3);
layout/components track [web #4](https://github.com/CodeLobbyStudio/codelobby-web/issues/4).
Registration/login follows in web #16, and API client/session/profile in web #17.

The current visual direction follows the team references recorded in
[docs/TEAM-DESIGN.md](docs/TEAM-DESIGN.md): a dark landing page with orange accents,
a static editor illustration, feature/step sections and an instructor section.
The editor's timer, people, tests and ranking are illustrative content, not a
running session or API responses. Run, Submit, Console and task navigation remain
disabled. The entire mockup is keyboard-accessible and opens a preview in a native
dialog; Description, Examples and Tests tabs switch local demonstration content.
Escape closes the dialog and restores focus.
The dialog has a fixed header, independently scrolling content and a single-column
mobile layout. Clicking the backdrop also closes it.
Navigation remains visible and wraps into centered rows on smaller screens.
Section navigation uses an explicit 650 ms scroll animation, including when native smooth scrolling is disabled;
the Tasks link centers the feature row in the viewport.
Inter and Space Grotesk fonts (including Polish glyphs) are self-hosted through
pinned Fontsource packages, without a third-party font service.
Lobby actions explain that functionality is forthcoming. Header section links
scroll through the landing page without URL fragments; Ranking currently shares
the Lobby section. Account-entry links use the existing routes.
Legal and social destinations remain local notices until actual documents and
official URLs are provided.

## API configuration

`VITE_API_BASE_URL` is public browser configuration, defaulting to `/api`.
`src/shared/api/config.ts` exposes it for the future API client; components should
not embed backend hostnames. All `VITE_*` variables are included in the client
bundle: never put passwords, JWT signing secrets or private keys in them.

During `npm run dev`, Vite forwards `/api/*` to `API_PROXY_TARGET` (default
`http://localhost:8080`), preserving the `/api` prefix. This allows future browser
requests to use the same origin without assuming backend CORS is configured.
`API_PROXY_TARGET` is used by the development server and is not exposed to the
browser. Restart Vite after changing `.env`.

For production, serve `dist/` with an SPA fallback to `index.html` for browser
routes such as `/profile`. Configure `/api` proxying separately, before the SPA
fallback. The development proxy does not configure production or `vite preview`.
If using an absolute `VITE_API_BASE_URL`, configure CORS on the backend and rebuild
the frontend with that value. Do not route API errors to `index.html`.

## Structure and contributing

See [docs/STRUKTURA.md](docs/STRUKTURA.md) for file responsibilities and the shared
[CodeLobby CONTRIBUTING](https://github.com/CodeLobbyStudio/.github/blob/main/CONTRIBUTING.md)
for branch naming and review rules. This repo inherits that organization guide;
there is no separate repository-specific `CONTRIBUTING.md`.
