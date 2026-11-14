import { useEffect, useRef, useState } from 'react';
import { basicSetup } from 'codemirror';
import { java } from '@codemirror/lang-java';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import type { WorkspaceFile } from './demoTask';

type Props = {
  file: WorkspaceFile;
  content: string;
  onChange: (path: string, content: string) => void;
};

export function JavaEditor({ file, content, onChange }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [initialContent] = useState(content);

  useEffect(() => {
    if (!container.current) return;
    const editable = file.role === 'EDITABLE';
    const view = new EditorView({
      parent: container.current,
      doc: initialContent,
      extensions: [
        basicSetup,
        java(),
        oneDark,
        EditorState.readOnly.of(!editable),
        EditorView.editable.of(editable),
        EditorView.contentAttributes.of({
          'aria-label': file.path,
          'aria-readonly': String(!editable),
          tabindex: '0',
        }),
        EditorView.updateListener.of((update) => {
          if (editable && update.docChanged) {
            onChange(file.path, update.state.doc.toString());
          }
        }),
      ],
    });

    return () => view.destroy();
  }, [file, initialContent, onChange]);

  return <div className="workspace-editor" ref={container} translate="no" />;
}
