import { useSession } from '../../features/auth/session';

const dateFormat = new Intl.DateTimeFormat('pl-PL', {
  dateStyle: 'long',
  timeStyle: 'short',
});

export function ProfilePage() {
  const state = useSession();
  if (state.status !== 'authenticated') return null;
  const { id, email, createdAt } = state.user;

  return (
    <>
      <p className="eyebrow">Twoje konto</p>
      <h1>Profil</h1>
      <dl className="profile-details">
        <dt>Identyfikator konta</dt>
        <dd>{id}</dd>
        <dt>Adres e-mail</dt>
        <dd>{email}</dd>
        <dt>Data utworzenia konta</dt>
        <dd>
          <time dateTime={createdAt}>
            {dateFormat.format(new Date(createdAt))}
          </time>
        </dd>
      </dl>
    </>
  );
}
