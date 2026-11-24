export const difficultyLabels = {
  EASY: 'Łatwe',
  MEDIUM: 'Średnie',
  HARD: 'Trudne',
};

type Difficulty = keyof typeof difficultyLabels;

export type TaskSummary = {
  id: number;
  catalogNumber: number | null;
  title: string;
  difficulty: Difficulty | null;
  tags: { name: string; slug: string }[];
  languages: ('JAVA' | 'CPP' | 'PYTHON')[];
};

const arrays = { name: 'Tablice', slug: 'arrays' };
const strings = { name: 'Napisy', slug: 'strings' };
const graphs = { name: 'Grafy', slug: 'graphs' };

export const officialTasks: TaskSummary[] = [
  {
    id: 1,
    catalogNumber: 1,
    title: 'Suma elementów',
    difficulty: 'EASY',
    tags: [arrays],
    languages: ['JAVA', 'PYTHON'],
  },
  {
    id: 7,
    catalogNumber: 7,
    title: 'Najdłuższy spójny podciąg rosnący',
    difficulty: 'MEDIUM',
    tags: [arrays],
    languages: ['JAVA', 'CPP'],
  },
  {
    id: 12,
    catalogNumber: 12,
    title: 'Palindrom',
    difficulty: 'EASY',
    tags: [strings],
    languages: ['JAVA', 'CPP', 'PYTHON'],
  },
  {
    id: 24,
    catalogNumber: 24,
    title: 'Najkrótsza ścieżka',
    difficulty: 'HARD',
    tags: [graphs],
    languages: ['JAVA', 'CPP'],
  },
  {
    id: 42,
    catalogNumber: 42,
    title: 'Binary search',
    difficulty: 'EASY',
    tags: [arrays],
    languages: ['JAVA', 'CPP', 'PYTHON'],
  },
  {
    id: 51,
    catalogNumber: 51,
    title: 'Wspólny prefiks',
    difficulty: 'EASY',
    tags: [strings],
    languages: ['PYTHON'],
  },
  {
    id: 64,
    catalogNumber: 64,
    title: 'Spójne składowe grafu',
    difficulty: 'MEDIUM',
    tags: [graphs],
    languages: ['JAVA', 'CPP'],
  },
  {
    id: 85,
    catalogNumber: 85,
    title: 'Scalanie przedziałów',
    difficulty: 'MEDIUM',
    tags: [arrays],
    languages: ['JAVA', 'PYTHON'],
  },
];

export const samplePrivateTasks: TaskSummary[] = [
  {
    id: 101,
    catalogNumber: null,
    title: 'Liczba unikalnych słów',
    difficulty: null,
    tags: [strings],
    languages: ['PYTHON'],
  },
  {
    id: 102,
    catalogNumber: null,
    title: 'Odwróć kolejność elementów',
    difficulty: 'EASY',
    tags: [arrays],
    languages: ['JAVA'],
  },
];

export const catalogTags = [graphs, strings, arrays];

export function filterOfficialTasks(params: URLSearchParams) {
  const query = (params.get('query') ?? '').trim().toLowerCase();
  const difficulty = params.get('difficulty');
  const tag = params.get('tag');
  const matches = officialTasks.filter((task) => {
    const matchesQuery = /^\d+$/.test(query)
      ? Number(query) === task.catalogNumber
      : task.title.toLowerCase().includes(query);

    return (
      matchesQuery &&
      (!difficulty || task.difficulty === difficulty) &&
      (!tag || task.tags.some(({ slug }) => slug === tag))
    );
  });

  if (params.get('sort') === 'title') {
    matches.sort((first, second) =>
      first.title.localeCompare(second.title, 'pl'),
    );
  }
  return matches;
}
