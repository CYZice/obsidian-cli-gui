export function parseArg(command: string, key: string): string {
  const quoted = command.match(new RegExp(`\\b${key}="((?:[^"\\\\]|\\\\.)*)"`));
  if (quoted?.[1] !== undefined) {
    return quoted[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  const plain = command.match(new RegExp(`\\b${key}=(\\S+)`));
  return plain?.[1] || "";
}
