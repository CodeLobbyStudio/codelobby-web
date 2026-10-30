import { NavLink, Outlet } from 'react-router-dom';

// Presentation only: session checks and protected routes belong to issue #17.
export function AccountLayout() {
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
