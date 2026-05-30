import type { CLIExecutionContext, WorkflowRunResultItem } from "../../types";

export function isPrevWriteCommand(command: string): boolean {
  return /^obsidian\s+(daily:append|daily:prepend|append|prepend)\b/.test(command);
}

export function escapePrevValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$/g, "\\$")
    .replace(/`/g, "\\`")
    .replace(/\r\n|\r|\n/g, "\\n");
}

export function buildWorkflowContext(
  command: string,
  index: number,
  results: WorkflowRunResultItem[],
): CLIExecutionContext {
  const context: CLIExecutionContext = {};
  if (!/^obsidian\s+agent\b/.test(command)) {
    return context;
  }

  const contextParts: string[] = [];
  for (let prevIndex = 0; prevIndex < index; prevIndex++) {
    const previous = results[prevIndex];
    if (previous) {
      contextParts.push(
        `步骤${previous.step}: ${previous.command}\n结果: ${(previous.result || "(无输出)").substring(0, 2000)}`,
      );
    }
  }

  if (contextParts.length > 0) {
    context.__workflowContext = contextParts.join("\n\n");
  }

  return context;
}

export function applyPrevToCommand(command: string, rawPrev: string): string {
  const escapedPrev = escapePrevValue(rawPrev);
  const prevPattern = /\{上一步结果\}|\{prev\}/g;
  const parts = command.split('"');

  for (let partIndex = 0; partIndex < parts.length; partIndex++) {
    parts[partIndex] =
      partIndex % 2 === 0
        ? parts[partIndex].replace(prevPattern, `"${escapedPrev}"`)
        : parts[partIndex].replace(prevPattern, escapedPrev);
  }

  return parts.join('"');
}
