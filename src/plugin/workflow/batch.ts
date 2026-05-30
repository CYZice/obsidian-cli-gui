import { Notice } from "obsidian";
import type { CLICommanderPluginInstance, WorkflowStep } from "../../types";

export async function executeBatchStep(
  plugin: CLICommanderPluginInstance,
  step: WorkflowStep,
  rawPrev: string,
  stepIndex: number,
  totalSteps: number,
): Promise<{ result: string; success: boolean }> {
  const batchLines = rawPrev
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  new Notice(`步骤 ${stepIndex + 1}/${totalSteps}: 批量执行 ${batchLines.length} 项`);

  const vault = plugin.app.vault;
  const moveMatch = step.command.match(/^obsidian\s+move\b.*?\bto=("([^"]*)"|([^\s"]+))/);
  if (moveMatch) {
    const moveTarget = moveMatch[2] !== undefined ? moveMatch[2] : moveMatch[3];
    let current = "";
    for (const segment of moveTarget.split("/")) {
      current = current ? `${current}/${segment}` : segment;
      if (!vault.getAbstractFileByPath(current)) {
        try {
          await vault.createFolder(current);
        } catch {
          // Folder may already exist due to race or nested creation.
        }
      }
    }
  }

  const renameMatch = step.command.match(/^obsidian\s+rename\b.*?\bname=("([^"]*)"|([^\s"]+))/);
  const renameMap = new Map<string, string>();
  if (renameMatch) {
    const requestedName = renameMatch[2] !== undefined ? renameMatch[2] : renameMatch[3];
    const folderNames = new Map<string, Set<string>>();

    for (const source of batchLines) {
      const folder = source.includes("/") ? source.substring(0, source.lastIndexOf("/")) : "";
      const sourceName = source.includes("/") ? source.split("/").pop() || source : source;
      const sourceDotIndex = sourceName.lastIndexOf(".");
      const sourceExtension = sourceDotIndex > 0 ? sourceName.substring(sourceDotIndex) : "";
      const requestedDotIndex = requestedName.lastIndexOf(".");
      const baseName = requestedDotIndex > 0 ? requestedName.substring(0, requestedDotIndex) : requestedName;
      const extension = requestedDotIndex > 0 ? requestedName.substring(requestedDotIndex) : sourceExtension;

      if (!folderNames.has(folder)) {
        const names = new Set<string>();
        vault
          .getFiles()
          .filter((file) => {
            const fileFolder = file.path.includes("/") ? file.path.substring(0, file.path.lastIndexOf("/")) : "";
            return fileFolder === folder;
          })
          .forEach((file) => names.add(file.name));
        folderNames.set(folder, names);
      }

      const names = folderNames.get(folder)!;
      let candidate = `${baseName}${extension}`;
      let suffix = 1;
      while (names.has(candidate)) {
        candidate = `${baseName}_${suffix}${extension}`;
        suffix++;
      }

      names.add(candidate);
      renameMap.set(source, candidate);
    }
  }

  const batchResults: string[] = [];
  for (const source of batchLines) {
    let batchCommand = step.command
      .replace(/\{file\}/g, source)
      .replace(/\{上一步结果\}/g, source)
      .replace(/\{prev\}/g, source);

    if (renameMatch && renameMap.has(source)) {
      batchCommand = batchCommand.replace(/\bname=("[^"]*"|[^\s"]+)/, `name="${renameMap.get(source)}"`);
    }

    if (moveMatch) {
      const moveTarget = moveMatch[2] !== undefined ? moveMatch[2] : moveMatch[3];
      const sourceName = source.includes("/") ? source.split("/").pop() || source : source;
      const resolvedTarget = `${moveTarget.replace(/\/$/, "")}/${sourceName}`;
      batchCommand = batchCommand.replace(/\bto=("[^"]*"|[^\s"]+)/, `to="${resolvedTarget}"`);
    }

    try {
      const output = await plugin.executeCLI(batchCommand);
      const trimmed = output ? output.trim() : "";
      if (trimmed && /^Error:/i.test(trimmed)) {
        if (/already exists/i.test(trimmed)) {
          batchResults.push(`⏭ ${source}: 已存在，跳过`);
        } else {
          batchResults.push(`❌ ${source}: ${trimmed}`);
          if (!step.continueOnError) {
            new Notice(`批量步骤 ${stepIndex + 1} 中 "${source}" 失败，序列已停止`);
            break;
          }
        }
      } else {
        batchResults.push(`✅ ${source}${trimmed ? `: ${trimmed}` : ""}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/already exists/i.test(message)) {
        batchResults.push(`⏭ ${source}: 已存在，跳过`);
      } else {
        batchResults.push(`❌ ${source}: ${message}`);
        if (!step.continueOnError) {
          new Notice(`批量步骤 ${stepIndex + 1} 中 "${source}" 失败，序列已停止`);
          break;
        }
      }
    }
  }

  return {
    result: batchResults.join("\n"),
    success: !batchResults.some((line) => line.startsWith("❌")),
  };
}
