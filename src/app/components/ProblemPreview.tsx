import { useId, useState } from 'react';
import { Icon } from '../../shared/components/Icon';

const tabs = ['Opis', 'Przykłady', 'Testy'];
const cases = [
  {
    input: '[1, 2, 3, 1, 2]',
    output: 3,
    detail: 'Najdłuższy spójny fragment rosnący to [1, 2, 3].',
  },
  {
    input: '[5, 4, 3, 2]',
    output: 1,
    detail:
      'Każda kolejna liczba jest mniejsza. Pojedynczy element ma długość 1.',
  },
  {
    input: '[2, 2, 3, 4, 1]',
    output: 3,
    detail: 'Równe liczby przerywają wzrost. Najdłuższy fragment to [2, 3, 4].',
  },
];

export function ProblemPreview({
  interactive = false,
}: {
  interactive?: boolean;
}) {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return (
    <div className="problem-pane">
      <div
        className="preview-tabs"
        role={interactive ? 'tablist' : undefined}
        aria-label={interactive ? 'Treść zadania' : undefined}
      >
        {tabs.map((label, index) =>
          interactive ? (
            <button
              key={label}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={selected === index}
              aria-controls={`${id}-panel`}
              tabIndex={selected === index ? 0 : -1}
              className={selected === index ? 'selected' : undefined}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => {
                const next =
                  event.key === 'ArrowRight'
                    ? (index + 1) % tabs.length
                    : event.key === 'ArrowLeft'
                      ? (index + tabs.length - 1) % tabs.length
                      : event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? tabs.length - 1
                          : undefined;
                if (next === undefined) return;
                event.preventDefault();
                setSelected(next);
                event.currentTarget.parentElement
                  ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
                  [next]?.focus();
              }}
            >
              {label}
            </button>
          ) : (
            <span key={label} className={index === 0 ? 'selected' : undefined}>
              {label}
            </span>
          ),
        )}
      </div>
      <div
        className="problem-content"
        role={interactive ? 'tabpanel' : undefined}
        id={interactive ? `${id}-panel` : undefined}
        aria-labelledby={interactive ? `${id}-tab-${selected}` : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        {selected === 0 && (
          <>
            <h3>Najdłuższy podciąg</h3>
            <p>
              Dana jest tablica liczb całkowitych. Znajdź długość najdłuższego
              spójnego podciągu rosnącego.
            </p>
            <h4>Wejście</h4>
            <p>
              Argument arr: tablica n liczb całkowitych przekazana do funkcji.
            </p>
            <h4>Wyjście</h4>
            <p>Zwróć długość najdłuższego spójnego podciągu rosnącego.</p>
            <h4 className="constraints-heading">
              <Icon name="chevron" /> Ograniczenia
            </h4>
            <p>
              1 ≤ n ≤ 10⁵
              <br />
              −10⁹ ≤ aᵢ ≤ 10⁹
            </p>
          </>
        )}
        {selected === 1 && (
          <>
            <h3>Przykłady</h3>
            <p>
              Szukamy kolejnych elementów tablicy, z których każdy jest większy
              od poprzedniego.
            </p>
            {cases.map((example, index) => (
              <section className="problem-example" key={example.input}>
                <h4>Przykład {index + 1}</h4>
                <p>
                  arr = <code>{example.input}</code>
                  <br />
                  Wynik: <strong>{example.output}</strong>
                </p>
                <p>{example.detail}</p>
              </section>
            ))}
          </>
        )}
        {selected === 2 && (
          <>
            <h3>Testy</h3>
            <p>
              Dane demonstracyjne do widocznych wyników testów. Podgląd nie
              uruchamia kodu.
            </p>
            {cases.map((example, index) => (
              <section className="problem-example" key={example.input}>
                <h4>Test {index + 1}</h4>
                <p>
                  arr = <code>{example.input}</code>
                  <br />
                  Oczekiwany wynik: <strong>{example.output}</strong>
                </p>
              </section>
            ))}
            <section className="problem-example">
              <h4>Test 4 (ukryty)</h4>
              <p>Dane wejściowe i oczekiwany wynik pozostają ukryte.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
