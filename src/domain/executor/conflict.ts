import type { CLICommanderPluginInstance } from "../../types";

export function resolveConflictPath(plugin: CLICommanderPluginInstance, targetPath: string): string {
  const vault = plugin.app.vault;
  if (!vault.getAbstractFileByPath(targetPath)) {
    return targetPath;
  }

  const dotIndex = targetPath.lastIndexOf(".");
  const slashIndex = targetPath.lastIndexOf("/") + 1;
  const hasExtension = slashIndex < dotIndex;
  const base = hasExtension ? targetPath.slice(0, dotIndex) : targetPath;
  const extension = hasExtension ? targetPath.slice(dotIndex) : "";

  if (plugin.settings.moveConflictSuffix === "timestamp") {
    return (
      base +
      "_" +
      new Date().toISOString().replace(/[:.]/g, "-").replace("T", "_").slice(0, 19) +
      extension
    );
  }

  let sequence = 1;
  let nextPath = `${base}_${sequence}${extension}`;
  while (vault.getAbstractFileByPath(nextPath)) {
    sequence++;
    nextPath = `${base}_${sequence}${extension}`;
  }

  return nextPath;
}
