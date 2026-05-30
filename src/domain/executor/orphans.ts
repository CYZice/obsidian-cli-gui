import { TFile } from "obsidian";
import type { CLICommanderPluginInstance } from "../../types";

export async function executeOrphansFolder(
  plugin: CLICommanderPluginInstance,
  command: string,
): Promise<string> {
  const folderMatch = command.match(/\bfolder=("([^"]*)"|([^\s"]+))/);
  const extMatch = command.match(/\bext=("([^"]*)"|([^\s"]+))/);
  const totalOnly = /\btotal\b/.test(command);
  const folder = folderMatch ? (folderMatch[2] !== undefined ? folderMatch[2] : folderMatch[3]) : "";
  const extFilter = extMatch ? (extMatch[2] !== undefined ? extMatch[2] : extMatch[3]) : "";

  const { vault, metadataCache } = plugin.app;
  const linkedFiles = new Set<string>();
  const filesWithLinks = new Set<string>();

  for (const resolved of Object.values(metadataCache.resolvedLinks)) {
    for (const target of Object.keys(resolved)) {
      linkedFiles.add(target);
    }
  }

  for (const [source, targets] of Object.entries(metadataCache.resolvedLinks)) {
    if (Object.keys(targets).length > 0) {
      filesWithLinks.add(source);
    }
  }

  const markdownFiles: TFile[] = [];
  for (const file of vault.getMarkdownFiles()) {
    const cache = metadataCache.getFileCache(file);
    if (cache?.frontmatter) {
      for (const [key, value] of Object.entries(cache.frontmatter)) {
        if (key === "position" || key === "tags" || typeof value !== "string" || !value.trim()) {
          continue;
        }

        const destination = metadataCache.getFirstLinkpathDest(value, file.path);
        if (destination) {
          linkedFiles.add(destination.path);
          filesWithLinks.add(file.path);
        }
      }
    }

    if (cache?.sections) {
      markdownFiles.push(file);
    }
  }

  const fileReads = markdownFiles.map((file) =>
    vault
      .cachedRead(file)
      .then((content) => ({ file, content }))
      .catch(() => null),
  );

  for (const item of await Promise.all(fileReads)) {
    if (!item) {
      continue;
    }

    const { file, content } = item;
    for (const match of content.matchAll(/src=["']([^"']+)["']/g)) {
      const source = decodeURIComponent(match[1]);
      const destination = metadataCache.getFirstLinkpathDest(source, file.path);
      if (destination) {
        linkedFiles.add(destination.path);
        filesWithLinks.add(file.path);
      }
    }
  }

  const allFiles =
    extFilter === "all"
      ? vault.getFiles()
      : extFilter
        ? vault.getFiles().filter((file) => {
            const extensions = extFilter
              .split(",")
              .map((value) => value.trim().toLowerCase().replace(/^\./, ""));
            return extensions.includes(file.extension.toLowerCase());
          })
        : vault.getMarkdownFiles();

  const folderPath = folder.replace(/\/$/, "") + "/";
  const orphans = (folder ? allFiles.filter((file) => file.path.startsWith(folderPath)) : allFiles).filter(
    (file) => !linkedFiles.has(file.path) && !filesWithLinks.has(file.path),
  );

  if (totalOnly) {
    return String(orphans.length);
  }

  return orphans.length ? orphans.map((file) => file.path).join("\n") : `「${folder || "整库"}」中没有孤立笔记`;
}
