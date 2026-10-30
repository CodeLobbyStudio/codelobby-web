import { Route, Routes } from 'react-router-dom';
import { AccountLayout } from './layouts/AccountLayout';
import { PublicLayout } from './layouts/PublicLayout';
import { SiteShell } from './layouts/SiteShell';
import { HomePage } from './pages/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RouteEffects } from './RouteEffects';

export function App() {
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
          <Route element={<AccountLayout />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}
