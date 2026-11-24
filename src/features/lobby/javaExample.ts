import type { JavaTaskInput } from './lobbyApi';

export const javaExample: JavaTaskInput = {
  title: 'Count lowercase vowels',
  description:
    'Implement Solution.countVowels(String text). Count the lowercase vowels a, e, i, o and u.',
  difficulty: 'EASY',
  languages: [
    {
      language: 'JAVA',
      files: [
        {
          path: 'src/Solution.java',
          type: 'EDITABLE',
          content: `public class Solution {
    public static int countVowels(String text) { return 0; }
}
`,
        },
        {
          path: 'src/Helpers.java',
          type: 'READ_ONLY',
          content: `public class Helpers {
    public static int count(String text) {
        int n = 0;
        for (char c : text.toCharArray()) if ("aeiou".indexOf(c) >= 0) n++;
        return n;
    }
}
`,
        },
        {
          path: 'tests/PublicTests.java',
          type: 'VISIBLE_TEST',
          content: `import java.nio.file.Files;
import java.nio.file.Path;
public class PublicTests {
    public static void main(String[] args) throws Exception {
        int actual = Solution.countVowels("codelobby");
        String status = actual == 3 ? "ACCEPTED" : "WRONG_ANSWER";
        String record = "{\\"testId\\":\\"public-1\\",\\"status\\":\\"" + status
            + "\\",\\"input\\":{\\"text\\":\\"codelobby\\"},\\"expectedOutput\\":3,\\"actualOutput\\":" + actual + "}\\n";
        Files.writeString(Path.of(System.getenv("CODELOBBY_REPORT_PATH")), record);
    }
}
`,
        },
      ],
      javaPublicTests: { mainClass: 'PublicTests', testIds: ['public-1'] },
    },
  ],
};
