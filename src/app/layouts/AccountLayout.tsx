import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../../features/auth/session';
import { SessionRecovery } from '../../features/auth/SessionRecovery';
import { LoadingIndicator } from '../../shared/components/LoadingIndicator';

export function AccountLayout() {
  const { status } = useSession();
  if (status === 'anonymous') return <Navigate to="/login" replace />;
  if (status === 'unavailable') return <SessionRecovery />;
  if (status === 'initializing') {
    return (
      <div className="account-layout content-width">
        <LoadingIndicator label="Sprawdzanie sesji…" />
      </div>
    );
  }
  return (
    <div className="account-layout content-width">
      <aside className="account-sidebar" aria-label="Część konta">
        <p className="eyebrow">Twoja przestrzeń</p>
        <nav aria-label="Nawigacja konta">
          <NavLink to="/profile">Profil</NavLink>
        </nav>
        <p className="sidebar-note">
          Zadania i lobby pojawią się w kolejnych etapach.
        </p>
      </aside>
      <div className="account-content">
        <Outlet />
      </div>
    </div>
  );
}
