import { TFile } from "obsidian";
import type { CLICommanderPluginInstance } from "../../types";

export function parseParam(command: string, key: string): string | null {
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
