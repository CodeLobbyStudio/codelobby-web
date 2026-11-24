import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../ErrorBoundary';

export function WorkspaceLayout() {
  const { pathname } = useLocation();
  return (
    <main id="main" className="workspace-shell" tabIndex={-1}>
      <ErrorBoundary key={pathname}>
        <Outlet />
      </ErrorBoundary>
    </main>
  );
}
