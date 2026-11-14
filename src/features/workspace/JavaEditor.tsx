import { useEffect, useRef, useState } from 'react';
import { editor, Uri } from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/languages/definitions/java/register.js';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import { demoTask, type WorkspaceFile } from './demoTask';
import { connectJavaLanguageServer } from './javaLanguageClient';

globalThis.MonacoEnvironment = { getWorker: () => new EditorWorker() };

type Props = {
  file: WorkspaceFile;
  onChange: (path: string, content: string) => void;
};

const statusLabels = {
  connecting: 'Łączenie z serwerem językowym Javy…',
  ready: 'Podpowiedzi i diagnostyka Javy włączone',
  unavailable:
    'Serwer językowy Javy niedostępny. Działają podpowiedzi słów z plików.',
};

export function JavaEditor({ file, onChange }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const workspace = useRef<{
    view: editor.IStandaloneCodeEditor;
    models: Map<string, editor.ITextModel>;
  } | null>(null);
  const viewStates = useRef(new Map<string, editor.ICodeEditorViewState>());
  const [status, setStatus] = useState<keyof typeof statusLabels>('connecting');

  useEffect(() => {
    if (!container.current) return;
    const models = new Map<string, editor.ITextModel>();
    const subscriptions = demoTask.files.map(({ path, role, content }) => {
      const model = editor.createModel(
        content,
        'java',
        Uri.from({ scheme: 'inmemory', path: '/' + path }),
      );
      models.set(path, model);
      return model.onDidChangeContent(() => {
        if (role === 'EDITABLE') onChange(path, model.getValue());
      });
    });
    const view = editor.create(container.current, {
      model: null,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      padding: { top: 8, bottom: 8 },
      wordBasedSuggestions: 'matchingDocuments',
      quickSuggestions: { other: 'on', comments: 'off', strings: 'off' },
      readOnly: true,
      domReadOnly: true,
    });
    workspace.current = { view, models };
    const disconnect = connectJavaLanguageServer(models, setStatus);
    return () => {
      disconnect();
      workspace.current = null;
      view.dispose();
      for (const subscription of subscriptions) subscription.dispose();
      for (const model of models.values()) model.dispose();
    };
  }, [onChange]);

  useEffect(() => {
    if (!workspace.current) return;
    const { view, models } = workspace.current;
    const previous = view.getModel();
    const state = view.saveViewState();
    if (previous && state) viewStates.current.set(previous.uri.path, state);
    const model = models.get(file.path);
    if (!model) return;
    view.setModel(model);
    const saved = viewStates.current.get(model.uri.path);
    if (saved) view.restoreViewState(saved);
    const readOnly = file.role === 'READ_ONLY';
    view.updateOptions({
      readOnly,
      domReadOnly: readOnly,
      ariaLabel: file.path,
    });
  }, [file, onChange]);

  return (
    <>
      <div className="workspace-editor" ref={container} translate="no" />
      <p className="workspace-language-status" role="status">
        {statusLabels[status]}
      </p>
    </>
  );
}
