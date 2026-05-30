import type { TFile, Vault } from "obsidian";
import type { NewNoteFolderContext } from "../../types";

export function getNewNoteFolderPath(ctx: NewNoteFolderContext): string {
  const vault = ctx?.vault;
  if (!vault) {
    return "";
  }

  const getConfig = (key: string): unknown => {
    try {
      if (typeof vault.getConfig === "function") {
        return vault.getConfig(key);
      }
    } catch {
      // Ignore and fall back to raw config access.
    }

    return vault.config?.[key];
  };

  const newFileLocation = getConfig("newFileLocation");
  const newFileFolderPath = String(getConfig("newFileFolderPath") || "").trim();
  if (newFileLocation === "folder" && newFileFolderPath) {
    return newFileFolderPath.replace(/\/+$/g, "");
  }

  if (newFileLocation === "current") {
    const activeFile = ctx.workspace?.getActiveFile?.();
    if (activeFile?.path) {
      const lastSlash = activeFile.path.lastIndexOf("/");
      return lastSlash === -1 ? "" : activeFile.path.slice(0, lastSlash);
    }
  }

  return "";
}

export function getUniqueUntitledPath(vault: Vault, folder: string): string {
  const folderPath = (folder || "").replace(/\/+$/g, "");
  const makePath = (name: string) => (folderPath ? `${folderPath}/${name}` : name);

  const firstPath = makePath("未命名.md");
  if (!vault.getAbstractFileByPath(firstPath)) {
    return firstPath;
  }

  let sequence = 1;
  for (;;) {
    const path = makePath(`未命名_${sequence}.md`);
    if (!vault.getAbstractFileByPath(path)) {
      return path;
    }
    sequence++;
  }
}
