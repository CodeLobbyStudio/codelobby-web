import { useEffect, useEffectEvent, useId, useRef, useState } from 'react';
import {
  editor,
  KeyCode,
  KeyMod,
  Uri,
} from 'monaco-editor/editor/editor.api.js';
import 'monaco-editor/languages/definitions/java/register.js';
import 'monaco-editor/editor/contrib/suggest/browser/suggestController.js';
import 'monaco-editor/editor/contrib/bracketMatching/browser/bracketMatching.js';
import 'monaco-editor/editor/contrib/find/browser/findController.js';
import 'monaco-editor/editor/contrib/folding/browser/folding.js';
import 'monaco-editor/editor/contrib/format/browser/formatActions.js';
import 'monaco-editor/editor/contrib/gotoError/browser/gotoError.js';
import 'monaco-editor/editor/contrib/hover/browser/hoverContribution.js';
import 'monaco-editor/editor/contrib/parameterHints/browser/parameterHints.js';
import 'monaco-editor/editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js';
import EditorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import { connectJavaLanguageServer } from './javaLanguageClient';

globalThis.MonacoEnvironment = { getWorker: () => new EditorWorker() };

type JavaFile = {
  path: string;
  role: 'EDITABLE' | 'READ_ONLY';
};

type Props = {
  file?: JavaFile;
  files?: readonly (JavaFile & { content: string })[];
  content?: string;
  onChange: (path: string, content: string) => void;
};

const statusLabels = {
  connecting: 'Łączenie z serwerem językowym Javy…',
  ready: 'Podpowiedzi i diagnostyka Javy włączone',
  unavailable:
    'Formatuj kod po połączeniu z serwerem językowym Javy. Podpowiedzi słów z plików działają lokalnie.',
};

export function JavaEditor({ file, files, content, onChange }: Props) {
  const workspaceId = useId();
  const activePath = file?.path;
  const standalonePath = files ? undefined : activePath;
  const activeRole = file?.role;
  const getStandaloneFile = useEffectEvent(() =>
    file ? [{ ...file, content: content ?? '' }] : [],
  );
  const reportChange = useEffectEvent(onChange);
  const applyingExternalContent = useRef(false);
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
    const states = viewStates.current;
    const subscriptions = (files ?? getStandaloneFile()).map(
      ({ path, role, content }) => {
        const model = editor.createModel(
          content,
          'java',
          Uri.from({
            scheme: 'inmemory',
            authority: workspaceId,
            path: '/' + path,
          }),
        );
        models.set(path, model);
        return model.onDidChangeContent(() => {
          if (role === 'EDITABLE' && !applyingExternalContent.current)
            reportChange(path, model.getValue());
        });
      },
    );
    const view = editor.create(container.current, {
      model: null,
      theme: 'vs-dark',
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'line',
      folding: true,
      foldingStrategy: 'indentation',
      hover: { enabled: 'on' },
      parameterHints: { enabled: true },
      padding: { top: 8, bottom: 8 },
      wordBasedSuggestions: 'matchingDocuments',
      quickSuggestions: { other: 'on', comments: 'off', strings: 'off' },
      readOnly: true,
      domReadOnly: true,
    });
    const closeFindShortcut = view.addAction({
      id: 'codelobby.closeFindWithSearchShortcut',
      label: 'Zamknij wyszukiwanie',
      keybindings: [KeyMod.CtrlCmd | KeyCode.KeyF],
      precondition: 'findWidgetVisible',
      run: (activeEditor) =>
        activeEditor.trigger('keyboard', 'closeFindWidget', null),
    });
    const formatShortcut = view.addAction({
      id: 'codelobby.formatJava',
      label: 'Formatuj kod',
      keybindings: [KeyMod.Shift | KeyMod.Alt | KeyCode.KeyF],
      keybindingContext: 'editorTextFocus',
      precondition: '!editorReadonly && editorHasDocumentFormattingProvider',
      run: (activeEditor) =>
        activeEditor.getAction('editor.action.formatDocument')?.run(),
    });
    workspace.current = { view, models };
    // The authoring form can change a file's path while it is being typed.
    // Connect JDT LS to stable project files in a workspace.
    let disconnect: (() => void) | undefined;
    const startLanguageServer = files
      ? window.setTimeout(() => {
          disconnect = connectJavaLanguageServer(models, setStatus);
        }, 0)
      : undefined;
    return () => {
      window.clearTimeout(startLanguageServer);
      disconnect?.();
      closeFindShortcut.dispose();
      formatShortcut.dispose();
      workspace.current = null;
      states.clear();
      view.dispose();
      for (const subscription of subscriptions) subscription.dispose();
      for (const model of models.values()) model.dispose();
    };
  }, [files, standalonePath, workspaceId]);

  useEffect(() => {
    if (!workspace.current) return;
    const { view, models } = workspace.current;
    const previous = view.getModel();
    const state = view.saveViewState();
    if (previous && state) viewStates.current.set(previous.uri.path, state);
    const model = (activePath && models.get(activePath)) || null;
    view.setModel(model);
    if (!model) return;
    const saved = viewStates.current.get(model.uri.path);
    if (saved) view.restoreViewState(saved);
    const readOnly = activeRole === 'READ_ONLY';
    view.updateOptions({
      readOnly,
      domReadOnly: readOnly,
      ariaLabel: activePath,
    });
  }, [activePath, activeRole, files]);

  useEffect(() => {
    if (!standalonePath || content === undefined) return;
    const model = workspace.current?.models.get(standalonePath);
    if (
      model &&
      model.getValue(editor.EndOfLinePreference.LF) !==
        content.replace(/\r\n/g, '\n')
    ) {
      applyingExternalContent.current = true;
      try {
        model.setValue(content);
      } finally {
        applyingExternalContent.current = false;
      }
    }
  }, [content, standalonePath]);

  return (
    <>
      <div className="workspace-editor" ref={container} translate="no" />
      {files && (
        <p className="workspace-language-status" role="status">
          {statusLabels[status]}
        </p>
      )}
    </>
  );
}
