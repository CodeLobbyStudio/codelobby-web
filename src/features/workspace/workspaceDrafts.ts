import type { WorkspaceFile } from '../lobby/lobbyApi';

export function readDrafts(
  key: string | undefined,
  files: WorkspaceFile[],
): Record<string, string> {
  if (!key) return {};
  try {
    const stored: unknown = JSON.parse(
      window.sessionStorage.getItem(key) ?? 'null',
    );
    if (!stored || typeof stored !== 'object' || Array.isArray(stored))
      return {};
    const saved = stored as Record<string, unknown>;
    return Object.fromEntries(
      files.flatMap(({ path, role }) => {
        const content = saved[path];
        return role === 'EDITABLE' &&
          Object.hasOwn(saved, path) &&
          typeof content === 'string'
          ? [[path, content]]
          : [];
      }),
    );
  } catch {
    return {};
  }
}

export function writeDrafts(
  key: string | undefined,
  files: Record<string, string>,
) {
  if (!key) return;
  try {
    if (Object.keys(files).length)
      window.sessionStorage.setItem(key, JSON.stringify(files));
    else window.sessionStorage.removeItem(key);
  } catch {
    // The current editor keeps its in-memory draft when browser storage is full or unavailable.
  }
}
