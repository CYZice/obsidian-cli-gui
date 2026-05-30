import { Notice, TFile } from "obsidian";
import type {
  CLICommanderPluginInstance,
  CLIExecutionContext,
  WorkflowDefinition,
  WorkflowRunResult,
  WorkflowRunResultItem,
  WorkflowStep,
} from "../types";

function isPrevWriteCommand(command: string): boolean {
  return /^obsidian\s+(daily:append|daily:prepend|append|prepend)\b/.test(command);
}

function escapePrevValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$/g, "\\$")
    .replace(/`/g, "\\`")
    .replace(/\r\n|\r|\n/g, "\\n");
}

function renderEvalResult(result: unknown): string {
  if (result == null) {
    return "(脚本执行完毕，无返回值)";
  }
  if (typeof result === "object") {
    return JSON.stringify(result, null, 2);
  }
  return String(result);
}

async function executeEvalStep(
  plugin: CLICommanderPluginInstance,
  step: WorkflowStep,
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

export async function runWorkflow(
  plugin: CLICommanderPluginInstance,
  workflow: WorkflowDefinition,
): Promise<WorkflowRunResult> {
  const results: WorkflowRunResultItem[] = [];
  let prevResult = "";

  for (let index = 0; index < workflow.steps.length; index++) {
    const step = workflow.steps[index];
    const rawPrev = prevResult.trim();
    const usesPrev = /\{上一步结果\}|\{prev\}/.test(step.command);
    let command = step.command;
    const context: CLIExecutionContext = {};

    if (/^obsidian\s+agent\b/.test(command)) {
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
    }

    if (step.batchMode && rawPrev) {
      const batchLines = rawPrev
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      new Notice(`步骤 ${index + 1}/${workflow.steps.length}: 批量执行 ${batchLines.length} 项`);

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
                new Notice(`批量步骤 ${index + 1} 中 "${source}" 失败，序列已停止`);
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
              new Notice(`批量步骤 ${index + 1} 中 "${source}" 失败，序列已停止`);
              break;
            }
          }
        }
      }

      prevResult = batchResults.join("\n");
      results.push({
        step: index + 1,
        command: step.command,
        result: prevResult,
        success: !batchResults.some((line) => line.startsWith("❌")),
      });
    } else {
      if (usesPrev && isPrevWriteCommand(command)) {
        new Notice(`步骤 ${index + 1}/${workflow.steps.length}: ${step.label || step.command}`);
        try {
          const output = await executePrevWrite(plugin, command, rawPrev);
          prevResult = output;
          results.push({
            step: index + 1,
            command: step.command,
            result: output,
            success: true,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({
            step: index + 1,
            command,
            result: message,
            success: false,
          });
          if (!step.continueOnError) {
            new Notice(`步骤 ${index + 1} 失败，序列已停止`);
            break;
          }
        }
      } else {
        if (usesPrev) {
          const escapedPrev = escapePrevValue(rawPrev);
          const prevPattern = /\{上一步结果\}|\{prev\}/g;
          const parts = command.split('"');
          for (let partIndex = 0; partIndex < parts.length; partIndex++) {
            parts[partIndex] =
              partIndex % 2 === 0
                ? parts[partIndex].replace(prevPattern, `"${escapedPrev}"`)
                : parts[partIndex].replace(prevPattern, escapedPrev);
          }
          command = parts.join('"');
        }

        new Notice(`步骤 ${index + 1}/${workflow.steps.length}: ${step.label || step.command}`);

        try {
          const output = step.isEval
            ? await executeEvalStep(plugin, step, command, rawPrev)
            : await plugin.executeCLI(command, context);
          prevResult = output;
          results.push({
            step: index + 1,
            command: step.isEval ? step.label || step.command : step.command,
            result: output,
            success: true,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          results.push({
            step: index + 1,
            command: step.isEval ? step.label || step.command : command,
            result: message,
            success: false,
          });
          if (!step.continueOnError) {
            new Notice(`步骤 ${index + 1} 失败，序列已停止`);
            break;
          }
        }
      }
    }

    if ((step.sleep || 0) > 0 && index < workflow.steps.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, step.sleep || 0));
    }
  }

  const combined = results
    .map((result) => `[步骤${result.step}] ${result.command}\n${result.result || "(无输出)"}`)
    .join("\n\n");
  const success = !results.some((result) => !result.success);

  return { results, combined, success };
}

function parseParam(command: string, key: string): string | null {
  const quoted = command.match(new RegExp(`${key}="((?:[^"\\\\]|\\\\.)*)"`));
  if (quoted) {
    return quoted[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t");
  }

  const plain = command.match(new RegExp(`${key}=([^\\s]+)`));
  return plain?.[1] || null;
}

export async function executePrevWrite(
  plugin: CLICommanderPluginInstance,
  command: string,
  prevResult: string,
): Promise<string> {
  const vault = plugin.app.vault;
  const action = command.match(/^obsidian\s+(daily:append|daily:prepend|append|prepend)\b/)?.[1];
  if (!action) {
    throw new Error("不支持的写入命令");
  }

  const isDaily = action.startsWith("daily:");
  const isPrepend = action.endsWith("prepend");
  let content = parseParam(command, "content") || "";
  content = content.replace(/\{上一步结果\}|\{prev\}/g, prevResult);

  const writeContent = /\binline\b/.test(command) ? content : `\n${content}`;

  if (isDaily) {
    const dailyPlugin = plugin.app.internalPlugins?.getPluginById("daily-notes");
    const moment = window.moment;
    if (!moment) {
      throw new Error("moment.js 不可用");
    }

    const format = String(dailyPlugin?.instance?.options?.format || "YYYY-MM-DD");
    const folder = String(dailyPlugin?.instance?.options?.folder || "");
    const dateName = moment().format(format);
    const filePath = folder ? `${folder}/${dateName}.md` : `${dateName}.md`;

    let file = vault.getAbstractFileByPath(filePath);
    if (!file) {
      await vault.create(filePath, "");
      file = vault.getAbstractFileByPath(filePath);
    }

    const existing = await vault.read(file!);
    await vault.modify(file!, isPrepend ? `${writeContent}\n${existing}` : `${existing}${writeContent}`);
    return "";
  }

  let filePath = parseParam(command, "path");
  if (!filePath) {
    const fileName = parseParam(command, "file");
    if (fileName) {
      const file = vault.getFiles().find(
        (candidate) =>
          candidate.basename === fileName || candidate.name === fileName || candidate.name === `${fileName}.md`,
      );
      if (!(file instanceof TFile)) {
        throw new Error(`文件 "${fileName}" 未找到`);
      }
      filePath = file.path;
    } else {
      const activeFile = plugin.app.workspace.getActiveFile();
      if (!activeFile) {
        throw new Error("没有活跃文件，请指定 file 或 path 参数");
      }
      filePath = activeFile.path;
    }
  }

  const targetFile = vault.getAbstractFileByPath(filePath);
  if (!targetFile) {
    throw new Error(`文件 "${filePath}" 未找到`);
  }

  const existing = await vault.read(targetFile);
  await vault.modify(targetFile, isPrepend ? `${writeContent}\n${existing}` : `${existing}${writeContent}`);
  return "";
}
