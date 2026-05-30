// @ts-nocheck
import type { CLICommandDefinition } from "../../types";
import { agentCommands } from "../commands/agent";
import { baseCommands } from "../commands/base";
import { bookmarksCommands } from "../commands/bookmarks";
import { dailyCommands } from "../commands/daily";
import { devCommands } from "../commands/dev";
import { filesCommands } from "../commands/files";
import { historyCommands } from "../commands/history";
import { linksCommands } from "../commands/links";
import { otherCommands } from "../commands/other";
import { pluginsCommands } from "../commands/plugins";
import { propertiesCommands } from "../commands/properties";
import { publishCommands } from "../commands/publish";
import { searchCommands } from "../commands/search";
import { syncCommands } from "../commands/sync";
import { tagsCommands } from "../commands/tags";
import { tasksCommands } from "../commands/tasks";
import { templatesCommands } from "../commands/templates";
import { themesCommands } from "../commands/themes";
import { vaultCommands } from "../commands/vault";
import { workspaceCommands } from "../commands/workspace";

const COMMAND_MODULES = [
  ["daily", dailyCommands],
  ["files", filesCommands],
  ["search", searchCommands],
  ["tasks", tasksCommands],
  ["links", linksCommands],
  ["tags", tagsCommands],
  ["properties", propertiesCommands],
  ["templates", templatesCommands],
  ["bookmarks", bookmarksCommands],
  ["plugins", pluginsCommands],
  ["themes", themesCommands],
  ["vault", vaultCommands],
  ["workspace", workspaceCommands],
  ["publish", publishCommands],
  ["sync", syncCommands],
  ["history", historyCommands],
  ["dev", devCommands],
  ["base", baseCommands],
  ["other", otherCommands],
  ["agent", agentCommands],
] as const;

const VALID_PARAM_TYPES = new Set(["text", "textarea", "number", "flag", "select"]);

function validateCommands(modules: readonly (readonly [string, CLICommandDefinition[]])[]): void {
  const ids = new Set<string>();

  for (const [expectedCategory, commands] of modules) {
    for (const command of commands) {
      if (command.category !== expectedCategory) {
        throw new Error(
          `[CLI_COMMANDS] Command "${command.id}" has category "${command.category}" but lives in "${expectedCategory}"`,
        );
      }

      if (ids.has(command.id)) {
        throw new Error(`[CLI_COMMANDS] Duplicate command id "${command.id}"`);
      }
      ids.add(command.id);

      for (const param of command.params || []) {
        if (!VALID_PARAM_TYPES.has(param.type)) {
          throw new Error(
            `[CLI_COMMANDS] Command "${command.id}" has invalid param type "${param.type}"`,
          );
        }
      }
    }
  }
}

validateCommands(COMMAND_MODULES);

export const CLI_COMMANDS: CLICommandDefinition[] = COMMAND_MODULES.flatMap(
  ([, commands]) => commands,
);
