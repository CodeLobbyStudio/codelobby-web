import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from '../../shared/components/Alert';
import { RunWorkspacePage } from '../workspace/RunWorkspacePage';
import { lobbyApi, positiveId } from './lobbyApi';

export default function LobbyWorkspacePage() {
  const params = useParams();
  const lobbyId = positiveId(params.lobbyId);
  const taskId = positiveId(params.taskId);
  if (lobbyId === null || taskId === null) {
    return <Alert title="Nieprawidłowy adres zadania." announce />;
  }
  return (
    <LobbyWorkspace
      key={`${lobbyId}/${taskId}`}
      lobbyId={lobbyId}
      taskId={taskId}
    />
  );
}

function LobbyWorkspace({
  lobbyId,
  taskId,
}: {
  lobbyId: number;
  taskId: number;
}) {
  const load = useCallback(
    (signal: AbortSignal) => lobbyApi.workspace(lobbyId, taskId, signal),
    [lobbyId, taskId],
  );
  return (
    <RunWorkspacePage
      scope={[lobbyId, taskId]}
      load={load}
      execute={(snapshot, signal) =>
        lobbyApi.run(lobbyId, taskId, snapshot, signal)
      }
      submit={(snapshot, signal) =>
        lobbyApi.submitSolution(lobbyId, taskId, snapshot, signal)
      }
      exit={{
        to: `/lobbies/${lobbyId}`,
        label: 'Wyjdź do lobby',
        confirm: true,
      }}
    />
  );
}
