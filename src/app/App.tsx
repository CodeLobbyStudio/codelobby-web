import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { session } from '../features/auth/session';
import { AccountLayout, RequireSession } from './layouts/AccountLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { SiteShell } from './layouts/SiteShell';
import { WorkspaceLayout } from './layouts/WorkspaceLayout';
import { HomePage } from './pages/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteEffects } from './RouteEffects';
import { LoadingIndicator } from '../shared/components/LoadingIndicator';
import { JoinLobbyPage } from '../features/lobby/JoinLobbyPage';
import { LobbyPage } from '../features/lobby/LobbyPage';
import { MyLobbiesPage } from '../features/lobby/MyLobbiesPage';

const LobbyWorkspacePage = lazy(
  () => import('../features/lobby/LobbyWorkspacePage'),
);
const CreateLobbyPage = lazy(() => import('../features/lobby/CreateLobbyPage'));

const TaskCatalogPreview = import.meta.env.DEV
  ? lazy(() => import('../features/tasks/TaskCatalogPreview'))
  : null;
const PracticeWorkspacePage = import.meta.env.DEV
  ? lazy(() => import('../features/workspace/PracticeWorkspacePage'))
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<RequireSession />}>
            <Route element={<AccountLayout />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="lobbies" element={<MyLobbiesPage />} />
              <Route
                path="lobbies/new"
                element={
                  <Suspense
                    fallback={
                      <LoadingIndicator label="Ładowanie formularza…" />
                    }
                  >
                    <CreateLobbyPage />
                  </Suspense>
                }
              />
              <Route path="lobbies/join" element={<JoinLobbyPage />} />
              <Route path="lobbies/:lobbyId" element={<LobbyPage />} />
            </Route>
            {TaskCatalogPreview && (
              <Route
                path="dev/tasks"
                element={
                  <Suspense
                    fallback={<LoadingIndicator label="Ładowanie podglądu…" />}
                  >
                    <TaskCatalogPreview />
                  </Suspense>
                }
              />
            )}
          </Route>
        </Route>
        <Route element={<WorkspaceLayout />}>
          <Route element={<RequireSession />}>
            {PracticeWorkspacePage && (
              <Route
                path="dev/workspace"
                element={
                  <Suspense
                    fallback={<LoadingIndicator label="Ładowanie edytora…" />}
                  >
                    <PracticeWorkspacePage />
                  </Suspense>
                }
              />
            )}
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
