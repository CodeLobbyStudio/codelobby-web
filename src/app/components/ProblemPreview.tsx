import { Icon } from '../../shared/components/Icon';

export function ProblemPreview() {
  return (
    <div className="problem-pane">
      <div className="preview-tabs">
        <span className="selected">Opis</span>
        <span>Przykłady</span>
        <span>Testy</span>
      </div>
      <div className="problem-content">
        <h3>Najdłuższy podciąg</h3>
        <p>
          Dana jest tablica liczb całkowitych. Znajdź długość najdłuższego
          spójnego podciągu rosnącego.
        </p>
        <h4>Wejście</h4>
        <p>Argument arr: tablica n liczb całkowitych przekazana do funkcji.</p>
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
      </div>
    </div>
  );
}
