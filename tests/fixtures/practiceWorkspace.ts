export const practiceWorkspace = {
  taskVersionId: 'practice-sum-v1',
  title: 'Suma elementów',
  description: 'Napisz metodę, która zwraca sumę liczb.',
  language: 'JAVA',
  files: [
    { path: 'src/Solution.java', type: 'EDITABLE', content: 'starter' },
    { path: 'src/Accumulator.java', type: 'EDITABLE', content: 'helper' },
    { path: 'src/Example.java', type: 'READ_ONLY', content: 'example' },
  ],
  publicTests: [
    {
      testId: 'positive',
      title: 'Liczby dodatnie',
      input: '[1, 2, 3]',
      expectedOutput: '6',
    },
    {
      testId: 'empty',
      title: 'Pusta tablica',
      input: '[]',
      expectedOutput: '0',
    },
  ],
};
