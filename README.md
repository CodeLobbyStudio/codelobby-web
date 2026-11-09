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

Login and registration use real backend endpoints through the development proxy.
The landing page and forms render without a backend, but successful registration
and login require the backend and its database. `/profile` remains a presentation
placeholder; profile loading, route protection and the full session lifecycle
belong to web #17.

Registration validates email and a password of at least 8 characters and at most
72 UTF-8 bytes (matching the backend's additional BCrypt limit). Passwords are not
trimmed or normalized. Registration returns a user record, not a token, and sends
the visitor to login with a confirmation. Login sends the returned Bearer token
to a minimal in-memory handoff module. It displays a success confirmation without
pretending the profile or active lobby is implemented. The token is lost on reload;
neither token nor password is written to browser storage, URLs or logs. Passwords
are cleared after successful submission. This is intentionally not a complete
authenticated session; web #17 will add `/me` verification and session management.
The notification icon is hidden for visitors and appears only after a successful
login in the current in-memory session. Notifications themselves are not yet
implemented, so the icon remains disabled. Reloading ends this temporary session
and hides the icon again.

### Test registration and login locally

1. Follow the sibling `codelobby-infra/README.md` to configure a local `.env` and
   start PostgreSQL with Docker Compose. Do not overwrite existing credentials.
2. Follow `codelobby-backend/README.md`: use Java 21, configure `DB_PASSWORD` and
   `JWT_SECRET_BASE64` only in the backend environment, then run
   `.\mvnw.cmd spring-boot:run` (or `./mvnw spring-boot:run` on Linux/macOS).
3. Start this frontend with `npm run dev`. Keep `VITE_API_BASE_URL=/api` and the
   default `API_PROXY_TARGET=http://localhost:8080`, or adjust your local `.env`
   and restart Vite when the backend runs elsewhere.
4. Open `/register`, create a disposable local test account and then sign in at
   `/login`. Try an already used email, a wrong password and a stopped backend.

Only email and password are sent to `/api/auth/register` and `/api/auth/login`.
Public auth requests omit credentials and Authorization. No automatic POST retry
is performed: on network failure or a 15-second timeout, retry manually. A timed
out registration might already have created the account, so try signing in first.
Requests are aborted when leaving the form; late responses cannot set the token.
Component tests mock fetch responses; they do not replace real API behavior in
the application or prove a live backend connection.

For the sibling-repository layout used by this project, Windows users can also
run `./scripts/start-local-backend.ps1` from this repository after starting Docker
Desktop. The script starts/checks PostgreSQL, reads database settings and
`JWT_SECRET_BASE64` from the ignored `codelobby-infra/.env`, selects an installed
Microsoft JDK 21 (or uses `JAVA_HOME`) and runs the backend bound to `127.0.0.1`.
Keep that terminal open; use a second terminal for `npm run dev`.

The local infra `.env` must include a private `JWT_SECRET_BASE64` value encoding
exactly 32 random bytes, in addition to its PostgreSQL settings. Keep the same
value across restarts to avoid invalidating tokens. The helper never prints these
values and does not put them in frontend environment variables. PostgreSQL data
stays in the `codelobby-local_postgres_data` Docker volume. Stop the database using
`docker compose --env-file .env -f local/compose.yaml stop` in the infra repository;
do not delete the volume when you want to keep local accounts.

Shared UI components include Button (disabled/loading), FormField (native input,
label, hint and validation feedback), Alert, LoadingIndicator, EmptyState and
ErrorState. Registration and login reuse these tested form controls.
Alerts announce dynamic content only
when the caller explicitly opts in with `announce`; static notices do not interrupt
screen readers. ErrorState uses safe copy rather than raw exception messages.

Bootstrap work tracks [web #3](https://github.com/CodeLobbyStudio/codelobby-web/issues/3);
layout/components track [web #4](https://github.com/CodeLobbyStudio/codelobby-web/issues/4).
Registration/login tracks web #16. The public JSON transport is shared with the
future authenticated API client/session/profile work in web #17.

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
`src/shared/api/config.ts` exposes it for the API client; components should
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
