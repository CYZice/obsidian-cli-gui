import type { CLICommanderPluginInstance } from "../../types";

export function renderEvalResult(result: unknown): string {
  if (result == null) {
    return "(脚本执行完毕，无返回值)";
  }
  if (typeof result === "object") {
    return JSON.stringify(result, null, 2);
  }
  return String(result);
}

export async function executeEvalStep(
  plugin: CLICommanderPluginInstance,
  command: string,
  prev: string,
): Promise<string> {
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => (...args: unknown[]) => Promise<unknown>;
  const runner = new AsyncFunction("app", "plugin", "obsidian", "executeCLI", "prev", command);
  const result = await runner(
    plugin.app,
    plugin,
    require("obsidian"),
    (cliCommand: string) => plugin.executeCLI(cliCommand),
    prev,
  );
  return renderEvalResult(result);
}
