/** Shared illustration data, not an API response or an active lobby. */
export const demoSource = [
  'def najdluzszy_podciag(arr):',
  '    if not arr:',
  '        return 0',
  '',
  '    best = 1',
  '    current = 1',
  '',
  '    for i in range(1, len(arr)):',
  '        if arr[i] > arr[i - 1]:',
  '            current += 1',
  '        else:',
  '            best = max(best, current)',
  '            current = 1',
  '',
  '    return max(best, current)',
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
