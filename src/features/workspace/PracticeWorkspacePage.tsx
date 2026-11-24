import { practiceApi } from '../lobby/lobbyApi';
import { RunWorkspacePage } from './RunWorkspacePage';

export default function PracticeWorkspacePage() {
  return (
    <RunWorkspacePage
      scope={['practice', 'sum']}
      load={practiceApi.workspace}
      execute={practiceApi.run}
      exit={{ to: '/dev/tasks', label: 'Wróć do katalogu zadań' }}
    />
  );
}
