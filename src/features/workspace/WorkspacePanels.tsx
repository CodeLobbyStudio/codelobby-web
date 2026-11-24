import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

const panels = {
  brief: {
    initial: 25,
    min: 12,
    max: 40,
    label: 'Szerokość opisu zadania',
    target: 'workspace-brief-panel',
  },
  project: {
    initial: 13,
    min: 9,
    max: 25,
    label: 'Szerokość drzewa plików',
    target: 'workspace-project-panel',
  },
  results: {
    initial: 16,
    min: 10,
    max: 48,
    label: 'Wysokość wyników testów',
    target: 'workspace-results-panel',
  },
};

type Panel = keyof typeof panels;
type Drag = { panel: Panel; start: number; size: number; span: number };

export function WorkspacePanels({
  brief,
  project,
  editor,
  results,
}: Record<Panel | 'editor', ReactNode>) {
  const [sizes, setSizes] = useState({
    brief: panels.brief.initial,
    project: panels.project.initial,
    results: panels.results.initial,
  });
  const drag = useRef<Drag | null>(null);
  const grid = useRef<HTMLDivElement>(null);

  function resize(panel: Panel, value: number) {
    const { min, max } = panels[panel];
    const size = Math.min(max, Math.max(min, value));
    setSizes((current) => ({ ...current, [panel]: size }));
  }

  function divider(panel: Panel) {
    const { label, target, min, max, initial } = panels[panel];
    const horizontal = panel === 'results';
    return (
      <div
        className={`workspace-divider workspace-divider--${panel}`}
        role="separator"
        tabIndex={0}
        aria-label={label}
        aria-orientation={horizontal ? 'horizontal' : 'vertical'}
        aria-controls={target}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(sizes[panel])}
        aria-valuetext={`${Math.round(sizes[panel])}%`}
        onPointerDown={(event) => {
          if (event.button !== 0 || !grid.current) return;
          const bounds = grid.current.getBoundingClientRect();
          drag.current = {
            panel,
            start: horizontal ? event.clientY : event.clientX,
            size: sizes[panel],
            span: horizontal ? bounds.height : bounds.width,
          };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.currentTarget.focus({ preventScroll: true });
        }}
        onPointerMove={(event) => {
          const active = drag.current;
          if (active?.panel !== panel || !active.span) return;
          const delta = horizontal
            ? active.start - event.clientY
            : event.clientX - active.start;
          resize(panel, active.size + (delta / active.span) * 100);
        }}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
        onDoubleClick={() => resize(panel, initial)}
        onKeyDown={(event) => {
          const increase = horizontal ? 'ArrowUp' : 'ArrowRight';
          const decrease = horizontal ? 'ArrowDown' : 'ArrowLeft';
          const targets: Record<string, number> = {
            [increase]: sizes[panel] + 2,
            [decrease]: sizes[panel] - 2,
            Home: min,
            End: max,
          };
          if (Object.hasOwn(targets, event.key)) {
            event.preventDefault();
            resize(panel, targets[event.key]);
          }
        }}
      />
    );
  }

  const styles = {
    '--workspace-brief-size': `${sizes.brief}%`,
    '--workspace-project-size': `${sizes.project}%`,
    '--workspace-results-size': `${sizes.results}%`,
  } as CSSProperties;

  return (
    <div ref={grid} className="workspace-ide-layout" style={styles}>
      {brief}
      {divider('brief')}
      {project}
      {divider('project')}
      {editor}
      {divider('results')}
      {results}
    </div>
  );
}
