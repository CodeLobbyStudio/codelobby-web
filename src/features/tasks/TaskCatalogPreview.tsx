import { Link, useSearchParams } from 'react-router-dom';
import type { FormEvent } from 'react';
import { Button } from '../../shared/components/Button';
import { EmptyState } from '../../shared/components/EmptyState';
import {
  catalogTags,
  difficultyLabels,
  filterOfficialTasks,
  samplePrivateTasks,
  type TaskSummary,
} from './catalogPreviewData';
import './taskCatalog.css';

const pageSize = 6;
const languageLabels = { JAVA: 'Java', CPP: 'C++', PYTHON: 'Python' };

function TaskList({ tasks, mine }: { tasks: TaskSummary[]; mine: boolean }) {
  return (
    <div className="task-catalog-list">
      {!mine && (
        <div
          className="task-catalog-row task-catalog-columns"
          aria-hidden="true"
        >
          <span>Zadanie</span>
          <span>Trudność</span>
          <span>Kategorie</span>
          <span>Języki</span>
        </div>
      )}
      <ul
        aria-label={
          mine
            ? 'Przykładowe zadania prywatne'
            : 'Przykładowe zadania oficjalne'
        }
      >
        {tasks.map((task) => (
          <li key={task.id} className="task-catalog-row">
            <h2>
              {task.catalogNumber !== null && (
                <span className="task-catalog-number">
                  #{task.catalogNumber}
                </span>
              )}
              {task.title}
            </h2>
            <span
              className={
                task.difficulty
                  ? 'task-difficulty task-difficulty--' +
                    task.difficulty.toLowerCase()
                  : 'task-difficulty'
              }
            >
              {task.difficulty
                ? difficultyLabels[task.difficulty]
                : 'Bez poziomu'}
            </span>
            <span>{task.tags.map(({ name }) => name).join(', ')}</span>
            <span>
              {task.languages
                .map((language) => languageLabels[language])
                .join(', ')}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TaskCatalogPreview() {
  const [params, setParams] = useSearchParams();
  const mine = params.get('view') === 'mine';
  const results = mine ? samplePrivateTasks : filterOfficialTasks(params);
  const totalPages = Math.max(1, Math.ceil(results.length / pageSize));
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Number.isInteger(requestedPage)
    ? Math.min(Math.max(1, requestedPage), totalPages)
    : 1;
  const visibleTasks = results.slice((page - 1) * pageSize, page * pageSize);
  const query = params.get('query') ?? '';
  const difficulty = params.get('difficulty') ?? '';
  const tag = params.get('tag') ?? '';
  const sort = params.get('sort') ?? '';

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const filters = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      const filter = String(value).trim();
      if (filter) filters.set(key, filter);
    }
    setParams(filters);
  }

  function pageLink(target: number) {
    const next = new URLSearchParams(params);
    if (target > 1) next.set('page', String(target));
    else next.delete('page');
    return { search: next.toString() };
  }

  return (
    <section className="task-catalog content-width">
      <header>
        <h1>{mine ? 'Moje zadania' : 'Katalog zadań'}</h1>
        <p>Podgląd deweloperski z przykładowymi danymi.</p>
      </header>
      <nav className="task-catalog-nav" aria-label="Widoki katalogu">
        <Link to="/dev/tasks" aria-current={!mine ? 'page' : undefined}>
          Oficjalne
        </Link>
        <Link to="?view=mine" aria-current={mine ? 'page' : undefined}>
          Moje zadania
        </Link>
      </nav>

      {!mine && (
        <form
          className="task-catalog-filters"
          onSubmit={applyFilters}
          onReset={() => setParams({})}
          key={JSON.stringify([query, difficulty, tag, sort])}
        >
          <label>
            Numer lub nazwa
            <input
              type="search"
              name="query"
              defaultValue={query}
              placeholder="np. 42 lub binary"
            />
          </label>
          <label>
            Trudność
            <select name="difficulty" defaultValue={difficulty}>
              <option value="">Wszystkie</option>
              {Object.entries(difficultyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Kategoria
            <select name="tag" defaultValue={tag}>
              <option value="">Wszystkie</option>
              {catalogTags.map(({ name, slug }) => (
                <option key={slug} value={slug}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Sortowanie
            <select name="sort" defaultValue={sort}>
              <option value="">Numer</option>
              <option value="title">Nazwa od A do Z</option>
            </select>
          </label>
          <div className="task-catalog-actions">
            <Button type="submit">Szukaj</Button>
            <Button type="reset" variant="secondary">
              Wyczyść filtry
            </Button>
          </div>
        </form>
      )}

      {visibleTasks.length ? (
        <TaskList tasks={visibleTasks} mine={mine} />
      ) : (
        <EmptyState
          title="Brak pasujących zadań"
          description="Zmień wyszukiwaną frazę lub wybierz inne filtry."
        />
      )}

      {!mine && (
        <div className="task-catalog-pagination">
          <p role="status">
            {results.length}{' '}
            {results.length === 1
              ? 'wynik'
              : results.length >= 2 && results.length <= 4
                ? 'wyniki'
                : 'wyników'}
          </p>
          {totalPages > 1 && (
            <nav aria-label="Strony wyników">
              {page > 1 && <Link to={pageLink(page - 1)}>Poprzednia</Link>}
              <span>
                Strona {page} z {totalPages}
              </span>
              {page < totalPages && (
                <Link to={pageLink(page + 1)}>Następna</Link>
              )}
            </nav>
          )}
        </div>
      )}
    </section>
  );
}
