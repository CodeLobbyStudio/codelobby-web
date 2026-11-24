import { Icon } from '../../shared/components/Icon';
import type { FileRole } from '../lobby/lobbyApi';

type FileId = string | number;
type ProjectFile<Id extends FileId> = { id: Id; path: string; role: FileRole };
type Folder<Id extends FileId> = {
  folders: Map<string, Folder<Id>>;
  files: ProjectFile<Id>[];
};
type Selection<Id extends FileId> = { selected?: Id; open: (id: Id) => void };

function folder<Id extends FileId>(): Folder<Id> {
  return { folders: new Map(), files: [] };
}

function FileList<Id extends FileId>({
  current,
  selected,
  open,
}: Selection<Id> & { current: Folder<Id> }) {
  return (
    <ul className="workspace-tree-list">
      {Array.from(current.folders)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, child]) => (
          <li key={`folder:${name}`}>
            <details open>
              <summary>
                <Icon name="chevron" />
                <Icon name="folder" />
                <span title={name}>{name}</span>
              </summary>
              <FileList current={child} selected={selected} open={open} />
            </details>
          </li>
        ))}
      {current.files.map(({ id, path, role }) => (
        <li key={`file:${id}`}>
          <button
            type="button"
            aria-current={id === selected ? 'true' : undefined}
            aria-label={
              role === 'READ_ONLY'
                ? `${path} (tylko do odczytu)`
                : role === 'VISIBLE_TEST'
                  ? `${path} (testy publiczne)`
                  : path
            }
            title={path}
            onClick={() => open(id)}
          >
            <Icon name={role === 'VISIBLE_TEST' ? 'file' : 'code'} />
            <span>{path.split('/').at(-1)}</span>
            {role === 'READ_ONLY' && (
              <Icon name="lock" className="workspace-file-lock" />
            )}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function WorkspaceFiles<Id extends FileId>({
  files,
  selected,
  open,
  className = '',
  id,
}: Selection<Id> & {
  files: ProjectFile<Id>[];
  className?: string;
  id?: string;
}) {
  const root = folder<Id>();
  for (const file of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    let current = root;
    for (const name of file.path.split('/').slice(0, -1).filter(Boolean)) {
      let child = current.folders.get(name);
      if (!child) {
        child = folder<Id>();
        current.folders.set(name, child);
      }
      current = child;
    }
    current.files.push(file);
  }

  return (
    <nav
      id={id}
      className={`workspace-explorer ${className}`}
      aria-label="Pliki projektu"
    >
      <h2>Projekt</h2>
      <FileList current={root} selected={selected} open={open} />
    </nav>
  );
}
