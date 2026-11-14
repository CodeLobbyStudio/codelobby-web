import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes } from 'react-router-dom';
import { session } from '../features/auth/session';
import { AccountLayout, RequireSession } from './layouts/AccountLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { SiteShell } from './layouts/SiteShell';
import { HomePage } from './pages/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteEffects } from './RouteEffects';
import { LoadingIndicator } from '../shared/components/LoadingIndicator';

const TaskCatalogPreview = import.meta.env.DEV
  ? lazy(() => import('../features/tasks/TaskCatalogPreview'))
  : null;
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
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<RequireSession />}>
            <Route element={<AccountLayout />}>
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            {TaskCatalogPreview && WorkspacePreview && (
              <Route
                element={
                  <Suspense
                    fallback={<LoadingIndicator label="Ładowanie podglądu…" />}
                  >
                    <Outlet />
                  </Suspense>
                }
              >
                <Route path="dev/tasks" element={<TaskCatalogPreview />} />
                <Route path="dev/workspace" element={<WorkspacePreview />} />
              </Route>
            )}
          </Route>
        </Route>
      </Routes>
    </>
  );
}
