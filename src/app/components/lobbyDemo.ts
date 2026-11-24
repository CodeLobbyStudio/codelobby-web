/** Shared illustration data, not an API response or an active lobby. */
export const demoSource = [
  'static int najdluzszyPodciag(int[] arr) {',
  '    if (arr.length == 0) return 0;',
  '    int best = 1, current = 1;',
  '',
  '    for (int i = 1; i < arr.length; i++) {',
  '        if (arr[i] > arr[i - 1]) {',
  '            current++;',
  '        } else {',
  '            current = 1;',
  '        }',
  '        best = Math.max(best, current);',
  '    }',
  '',
  '    return best;',
  '}',
];
export const demoTestDurations = [0, 8, 16, 28];
export const demoCases = [
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
export const demoRanking = [
  ['Ty', '100', `${demoTestDurations.reduce((sum, time) => sum + time, 0)} ms`],
  ['Kaczan', '100', '67 ms'],
  ['PawełBM', '100', '118 ms'],
  ['Oliwka', '100', '181 ms'],
  ['Simon', '75', '60 ms'],
] as const;
