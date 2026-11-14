export const demoTask = {
  versionId: 'demo-sum-v1',
  title: 'Suma elementów',
  description:
    'Napisz metodę, która zwraca sumę liczb całkowitych w tablicy. Dla pustej tablicy zwróć 0.',
  files: [
    {
      path: 'src/Solution.java',
      role: 'EDITABLE',
      content:
        'public class Solution {\n    public int sum(int[] values) {\n        // Uzupełnij rozwiązanie\n        return 0;\n    }\n}\n',
    },
    {
      path: 'src/Accumulator.java',
      role: 'EDITABLE',
      content:
        'public class Accumulator {\n    // Możesz tu dodać kod pomocniczy.\n}\n',
    },
    {
      path: 'src/Example.java',
      role: 'READ_ONLY',
      content:
        'public class Example {\n    public static void main(String[] args) {\n        System.out.println(new Solution().sum(new int[]{1, 2, 3}));\n    }\n}\n',
    },
  ],
  tests: [
    {
      id: 'positive',
      title: 'Liczby dodatnie',
      input: '[1, 2, 3]',
      expected: '6',
    },
    { id: 'empty', title: 'Pusta tablica', input: '[]', expected: '0' },
  ],
} as const;

export type WorkspaceFile = (typeof demoTask.files)[number];

export const scenarios = {
  accepted: 'Wszystkie testy zaliczone',
  wrongAnswer: 'Błędny wynik',
  compilationError: 'Błąd kompilacji',
  timeLimit: 'Przekroczony limit czasu',
  unavailable: 'Usługa niedostępna',
  timeout: 'Brak odpowiedzi w wyznaczonym czasie',
} as const;

export type Scenario = keyof typeof scenarios;
