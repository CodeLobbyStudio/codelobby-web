export function isJavaSourcePath(path: string) {
  return (
    path.length <= 240 &&
    path.endsWith('.java') &&
    path
      .split('/')
      .every(
        (part) =>
          /^[a-z\d_.-]+$/i.test(part) &&
          !part.endsWith('.') &&
          !/^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part),
      )
  );
}
