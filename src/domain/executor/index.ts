import { resolveTemplateVars } from "../commands/builder";
import { executeAgent } from "./agent";
import { resolveConflictPath } from "./conflict";
import { executeOrphansFolder } from "./orphans";
import { executeShellCommand } from "./shell";
import type { CLICommanderPluginInstance, CLIExecutionContext } from "../../types";

export async function executeCLI(
  plugin: CLICommanderPluginInstance,
  rawCommand: string,
  options?: CLIExecutionContext,
): Promise<string> {
  let command = resolveTemplateVars(rawCommand, plugin.app);

  if (/^obsidian\s+agent\b/.test(command)) {
    return executeAgent(plugin, command, options);
  }

  if (/^obsidian\s+orphans:folder\b/.test(command)) {
    return executeOrphansFolder(plugin, command);
  }

  if (plugin.settings.moveConflictRename) {
    const moveMatch = command.match(/^obsidian\s+move\b(.*?)\bto=("([^"]*)"|([^\s"]+))(.*)/);
    if (moveMatch) {
      const targetPath = moveMatch[3] !== undefined ? moveMatch[3] : moveMatch[4];
      const resolvedPath = resolveConflictPath(plugin, targetPath);
      if (resolvedPath !== targetPath) {
        command = command.replace(/\bto=("[^"]*"|[^\s"]+)/, `to="${resolvedPath}"`);
      }
    }
  }

  return executeShellCommand(plugin, command, options);
}
