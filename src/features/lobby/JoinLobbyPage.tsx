import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { Button } from '../../shared/components/Button';
import { FormField } from '../../shared/components/FormField';
import { lobbyApi } from './lobbyApi';
import { useLobbyAction } from './useLobbyRequest';
import './lobby.css';

function joinCode(input: string) {
  const value = input.trim();
  if (/^[a-z\d]{8}$/i.test(value)) return value;
  try {
    const url = new URL(value, window.location.origin);
    const code =
      url.pathname === '/lobbies/join' ? url.searchParams.get('code') : null;
    return code && /^[a-z\d]{8}$/i.test(code) ? code : null;
  } catch {
    return null;
  }
}

export function JoinLobbyPage() {
  const [params] = useSearchParams();
  const code = params.get('code') ?? '';
  return <JoinForm key={code} initialCode={code} />;
}

function JoinForm({ initialCode }: { initialCode: string }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(initialCode);
  const [validationError, setValidationError] = useState('');
  const action = useLobbyAction();

  async function join(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invite = joinCode(code);
    if (!invite) {
      setValidationError(
        'Wpisz ośmioznakowy kod albo wklej link do zaproszenia.',
      );
      return;
    }
    const lobby = await action.submit((signal) =>
      lobbyApi.join(invite, signal),
    );
    if (lobby) void navigate('/lobbies/' + lobby.id, { replace: true });
  }

  return (
    <section className="lobby-page">
      <h1>Dołącz do lobby</h1>
      <form className="lobby-form" onSubmit={(event) => void join(event)}>
        {action.error && (
          <Alert title={action.error} variant="error" announce />
        )}
        <FormField
          label="Kod zaproszenia"
          required
          maxLength={2048}
          hint="Możesz też wkleić cały link do zaproszenia."
          error={validationError || undefined}
          autoComplete="off"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setValidationError('');
          }}
        />
        <Button
          type="submit"
          disabled={!code.trim()}
          loading={action.pending}
          loadingLabel="Dołączanie…"
        >
          Dołącz
        </Button>
      </form>
    </section>
  );
}
