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
  Hover,
  MarkupContent,
  Range,
  SignatureHelp,
  TextEdit,
} from 'vscode-languageserver-types';
import { isJavaSourcePath } from './javaSourcePath';

type Status = 'connecting' | 'ready' | 'unavailable';

function editorRange({ start, end }: Range) {
  return {
    startLineNumber: start.line + 1,
    startColumn: start.character + 1,
    endLineNumber: end.line + 1,
    endColumn: end.character + 1,
  };
}

function documentation(value?: string | MarkupContent) {
  if (!value || typeof value === 'string') return value;
  return value.kind === 'markdown' ? { value: value.value } : value.value;
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
  const javaModels = new Map(
    [...models].filter(([path]) => isJavaSourcePath(path)),
  );
  if (!import.meta.env.DEV || javaModels.size === 0) {
    const status = window.setTimeout(() => onStatus('unavailable'), 0);
    return () => window.clearTimeout(status);
  }
  const url = new URL('/dev/java-lsp', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  const socket = new WebSocket(url);
  const disposables: { dispose(): void }[] = [];
  const pathsByUri = new Map<string, editor.ITextModel>();
  const logger = { error() {}, warn() {}, info() {}, log() {} };
  let closed = false;

  const timeout = window.setTimeout(() => socket.close(), 45_000);
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
  socket.addEventListener('open', () => {
    if (closed) return;
    socket.send(
      JSON.stringify({
        files: [...javaModels].map(([path, model]) => ({
          path,
          text: model.getValue(),
        })),
      }),
    );
  });
  socket.addEventListener(
    'message',
    async (event) => {
      try {
        const { rootUri, documents } = JSON.parse(String(event.data)) as {
          rootUri: string;
          documents: [string, string][];
        };
        const urisByModel = new Map<editor.ITextModel, string>();
        for (const [path, uri] of documents) {
          const model = javaModels.get(path);
          if (!model) throw new Error('Unknown Java workspace file');
          pathsByUri.set(new URL(uri).href, model);
          urisByModel.set(model, uri);
        }

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
              hover: { contentFormat: ['markdown', 'plaintext'] },
              signatureHelp: {
                signatureInformation: {
                  documentationFormat: ['markdown', 'plaintext'],
                  parameterInformation: { labelOffsetSupport: true },
                },
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
        for (const [model, uri] of urisByModel) {
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
              const uri = urisByModel.get(model);
              if (!uri || token.isCancellationRequested) return;
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
                    textDocument: { uri },
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
        disposables.push(
          languages.registerSignatureHelpProvider('java', {
            signatureHelpTriggerCharacters: ['(', ','],
            async provideSignatureHelp(model, position, token, context) {
              const result = await requestForModel<SignatureHelp>(
                'textDocument/signatureHelp',
                model,
                {
                  position: {
                    line: position.lineNumber - 1,
                    character: position.column - 1,
                  },
                  context: {
                    triggerKind: context.triggerKind,
                    triggerCharacter: context.triggerCharacter,
                    isRetrigger: context.isRetrigger,
                  },
                },
                token,
              );
              if (!result?.signatures.length) return;
              return {
                value: {
                  activeSignature: result.activeSignature ?? 0,
                  activeParameter: result.activeParameter ?? 0,
                  signatures: result.signatures.map((signature) => ({
                    ...signature,
                    activeParameter: signature.activeParameter ?? undefined,
                    documentation: documentation(signature.documentation),
                    parameters: (signature.parameters ?? []).map(
                      (parameter) => ({
                        ...parameter,
                        documentation: documentation(parameter.documentation),
                      }),
                    ),
                  })),
                },
                dispose() {},
              };
            },
          }),
          languages.registerHoverProvider('java', {
            async provideHover(model, position, token) {
              const result = await requestForModel<Hover>(
                'textDocument/hover',
                model,
                {
                  position: {
                    line: position.lineNumber - 1,
                    character: position.column - 1,
                  },
                },
                token,
              );
              if (!result) return;
              const entries = Array.isArray(result.contents)
                ? result.contents
                : [result.contents];
              return {
                range: result.range ? editorRange(result.range) : undefined,
                contents: entries.map((entry) => {
                  if (typeof entry === 'string') return { value: entry };
                  if ('language' in entry)
                    return {
                      value:
                        '\x60\x60\x60' +
                        entry.language +
                        '\n' +
                        entry.value +
                        '\n\x60\x60\x60',
                    };
                  return {
                    value:
                      entry.kind === 'markdown'
                        ? entry.value
                        : entry.value.replace(
                            /[\x21-\x2f\x3a-\x40\x5b-\x60\x7b-\x7e]/g,
                            (character) => '\\' + character,
                          ),
                  };
                }),
              };
            },
          }),
          languages.registerDocumentFormattingEditProvider('java', {
            async provideDocumentFormattingEdits(model, options, token) {
              const edits = await requestForModel<TextEdit[]>(
                'textDocument/formatting',
                model,
                {
                  options: {
                    tabSize: options.tabSize,
                    insertSpaces: options.insertSpaces,
                  },
                },
                token,
              );
              return (
                edits?.map(({ range, newText }) => ({
                  range: editorRange(range),
                  text: newText,
                })) ?? []
              );
            },
          }),
        );

        async function requestForModel<Result>(
          method: string,
          model: editor.ITextModel,
          params: object,
          token: import('monaco-editor/editor/editor.api.js').CancellationToken,
        ) {
          const uri = urisByModel.get(model);
          if (!uri || token.isCancellationRequested) return;
          const version = model.getVersionId();
          try {
            const result = await connection.sendRequest<Result | null>(
              method,
              { textDocument: { uri }, ...params },
              token,
            );
            if (
              !token.isCancellationRequested &&
              !model.isDisposed() &&
              version === model.getVersionId()
            )
              return result;
          } catch {
            // The editor remains usable if the language server disconnects.
          }
        }
        clearTimeout(timeout);
        onStatus('ready');
      } catch (error) {
        if (closed) return;
        console.warn('Java language server initialization failed:', error);
        unavailable();
      }
    },
    { once: true },
  );
  return disconnect;
}
