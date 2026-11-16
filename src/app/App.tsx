import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { session } from '../features/auth/session';
import { AccountLayout } from './layouts/AccountLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { SiteShell } from './layouts/SiteShell';
import { HomePage } from './pages/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteEffects } from './RouteEffects';
import { LoadingIndicator } from '../shared/components/LoadingIndicator';
import { CreateLobbyPage } from '../features/lobby/CreateLobbyPage';
import { JoinLobbyPage } from '../features/lobby/JoinLobbyPage';
import { LobbyPage } from '../features/lobby/LobbyPage';

const LobbyWorkspacePage = lazy(
  () => import('../features/lobby/LobbyWorkspacePage'),
);

const WorkspacePreview = import.meta.env.DEV
  ? lazy(() => import('../features/workspace/WorkspacePreview'))
  : null;

export function App() {
  useEffect(() => {
    void session.restore();
  }, []);

  return (
    <>
      <RouteEffects />
      <Routes>
        <Route element={<SiteShell />}>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route
              path="login"
              element={<AuthPage key="login" mode="login" />}
            />
            <Route
              path="register"
              element={<AuthPage key="register" mode="register" />}
            />
            {WorkspacePreview && (
              <Route
                path="dev/workspace"
                element={
                  <Suspense
                    fallback={<LoadingIndicator label="Ładowanie edytora…" />}
                  >
                    <WorkspacePreview />
                  </Suspense>
                }
              />
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<AccountLayout />}>
            <Route path="profile" element={<ProfilePage />} />
            <Route path="lobbies/new" element={<CreateLobbyPage />} />
            <Route path="lobbies/join" element={<JoinLobbyPage />} />
            <Route path="lobbies/:lobbyId" element={<LobbyPage />} />
            <Route
              path="lobbies/:lobbyId/tasks/:taskId"
              element={
                <Suspense
                  fallback={<LoadingIndicator label="Ładowanie edytora…" />}
                >
                  <LobbyWorkspacePage />
                </Suspense>
              }
            />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
