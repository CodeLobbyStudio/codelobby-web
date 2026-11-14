import {
  editor,
  languages,
  MarkerSeverity,
} from 'monaco-editor/editor/editor.api.js';
import { createWebSocketConnection, toSocket } from 'vscode-ws-jsonrpc';
import 'vscode-jsonrpc/browser';
import type {
  CompletionItem,
  CompletionList,
  Diagnostic,
  Range,
} from 'vscode-languageserver-types';

type Status = 'connecting' | 'ready' | 'unavailable';

function editorRange({ start, end }: Range) {
  return {
    startLineNumber: start.line + 1,
    startColumn: start.character + 1,
    endLineNumber: end.line + 1,
    endColumn: end.character + 1,
  };
}

function completionKind(kind: number | undefined) {
  // LSP completion kinds are one-based and use a different order from Monaco.
  const kinds = languages.CompletionItemKind;
  return (
    [
      kinds.Text,
      kinds.Method,
      kinds.Function,
      kinds.Constructor,
      kinds.Field,
      kinds.Variable,
      kinds.Class,
      kinds.Interface,
      kinds.Module,
      kinds.Property,
      kinds.Unit,
      kinds.Value,
      kinds.Enum,
      kinds.Keyword,
      kinds.Snippet,
      kinds.Color,
      kinds.File,
      kinds.Reference,
      kinds.Folder,
      kinds.EnumMember,
      kinds.Constant,
      kinds.Struct,
      kinds.Event,
      kinds.Operator,
      kinds.TypeParameter,
    ][(kind ?? 1) - 1] ?? kinds.Text
  );
}

export function connectJavaLanguageServer(
  models: Map<string, editor.ITextModel>,
  onStatus: (status: Status) => void,
) {
  const url = new URL('/dev/java-lsp', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(url);
  const disposables: { dispose(): void }[] = [];
  const pathsByUri = new Map<string, editor.ITextModel>();
  const logger = { error() {}, warn() {}, info() {}, log() {} };
  let closed = false;

  const timeout = window.setTimeout(() => socket.close(), 25_000);
  function disconnect() {
    closed = true;
    clearTimeout(timeout);
    socket.removeEventListener('close', unavailable);
    for (const disposable of disposables.splice(0).reverse())
      disposable.dispose();
    for (const model of models.values()) {
      if (!model.isDisposed()) editor.setModelMarkers(model, 'java-lsp', []);
    }
    if (socket.readyState < WebSocket.CLOSING) socket.close();
  }
  function unavailable() {
    if (closed) return;
    disconnect();
    onStatus('unavailable');
  }
  socket.addEventListener('close', unavailable);
  socket.addEventListener(
    'message',
    async (event) => {
      try {
        const { rootUri } = JSON.parse(String(event.data)) as {
          rootUri: string;
        };
        const uriFor = (path: string) => `${rootUri}/${path}`;
        for (const [path, model] of models) pathsByUri.set(uriFor(path), model);

        const connection = createWebSocketConnection(toSocket(socket), logger);
        disposables.push(connection);
        connection.onRequest(
          'workspace/configuration',
          ({ items }: { items: unknown[] }) => items.map(() => null),
        );
        connection.onNotification(
          'textDocument/publishDiagnostics',
          ({
            uri,
            version,
            diagnostics,
          }: {
            uri: string;
            version?: number;
            diagnostics: Diagnostic[];
          }) => {
            const model = pathsByUri.get(new URL(uri).href);
            if (!model || (version != null && version !== model.getVersionId()))
              return;
            editor.setModelMarkers(
              model,
              'java-lsp',
              diagnostics.map((diagnostic) => ({
                ...editorRange(diagnostic.range),
                message:
                  typeof diagnostic.message === 'string'
                    ? diagnostic.message
                    : diagnostic.message.value,
                severity:
                  [
                    MarkerSeverity.Error,
                    MarkerSeverity.Warning,
                    MarkerSeverity.Info,
                    MarkerSeverity.Hint,
                  ][(diagnostic.severity ?? 1) - 1] ?? MarkerSeverity.Error,
                source: 'Java',
              })),
            );
          },
        );
        connection.listen();
        await connection.sendRequest('initialize', {
          processId: null,
          rootUri,
          workspaceFolders: [{ uri: rootUri, name: 'CodeLobby' }],
          capabilities: {
            textDocument: {
              synchronization: {},
              completion: {
                completionItem: { snippetSupport: true },
              },
              publishDiagnostics: { versionSupport: true },
            },
          },
          initializationOptions: {
            settings: {
              java: {
                import: {
                  maven: { enabled: false },
                  gradle: { enabled: false },
                },
              },
            },
          },
        });
        await connection.sendNotification('initialized', {});
        for (const [path, model] of models) {
          const uri = uriFor(path);
          await connection.sendNotification('textDocument/didOpen', {
            textDocument: {
              uri,
              languageId: 'java',
              version: model.getVersionId(),
              text: model.getValue(),
            },
          });
          disposables.push(
            model.onDidChangeContent(({ changes }) => {
              editor.setModelMarkers(model, 'java-lsp', []);
              void connection
                .sendNotification('textDocument/didChange', {
                  textDocument: { uri, version: model.getVersionId() },
                  contentChanges: changes.map(({ range, text }) => ({
                    range: {
                      start: {
                        line: range.startLineNumber - 1,
                        character: range.startColumn - 1,
                      },
                      end: {
                        line: range.endLineNumber - 1,
                        character: range.endColumn - 1,
                      },
                    },
                    text,
                  })),
                })
                .catch(unavailable);
            }),
          );
        }
        disposables.push(
          languages.registerCompletionItemProvider('java', {
            triggerCharacters: ['.'],
            async provideCompletionItems(model, position, context, token) {
              const path = model.uri.path.slice(1);
              if (models.get(path) !== model || token.isCancellationRequested)
                return;
              const word = model.getWordUntilPosition(position);
              const defaultRange = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
              };
              const version = model.getVersionId();
              try {
                const response = await connection.sendRequest<
                  CompletionList | CompletionItem[] | null
                >(
                  'textDocument/completion',
                  {
                    textDocument: { uri: uriFor(path) },
                    position: {
                      line: position.lineNumber - 1,
                      character: position.column - 1,
                    },
                    context: {
                      triggerKind: context.triggerKind + 1,
                      triggerCharacter: context.triggerCharacter,
                    },
                  },
                  token,
                );
                if (
                  token.isCancellationRequested ||
                  model.isDisposed() ||
                  version !== model.getVersionId()
                )
                  return;
                const items = Array.isArray(response)
                  ? response
                  : (response?.items ?? []);
                return {
                  incomplete:
                    !Array.isArray(response) && response?.isIncomplete,
                  suggestions: items.map((item) => {
                    const edit = item.textEdit;
                    return {
                      label: item.label,
                      detail: item.detail,
                      kind: completionKind(item.kind),
                      filterText: item.filterText,
                      sortText: item.sortText,
                      insertText:
                        edit?.newText ?? item.insertText ?? item.label,
                      range: edit
                        ? editorRange(
                            'range' in edit ? edit.range : edit.replace,
                          )
                        : defaultRange,
                      insertTextRules:
                        item.insertTextFormat === 2
                          ? languages.CompletionItemInsertTextRule
                              .InsertAsSnippet
                          : undefined,
                      additionalTextEdits: item.additionalTextEdits?.map(
                        ({ range, newText }) => ({
                          range: editorRange(range),
                          text: newText,
                        }),
                      ),
                    };
                  }),
                };
              } catch {
                // The standalone word suggestions remain available after a failed LSP request.
                return;
              }
            },
          }),
        );
        clearTimeout(timeout);
        onStatus('ready');
      } catch (error) {
        console.warn('Java language server initialization failed:', error);
        unavailable();
      }
    },
    { once: true },
  );
  return disconnect;
}
