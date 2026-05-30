import { Notice, TFile } from "obsidian";
import path from "path";
import fs from "fs";
import { exec, execSync } from "child_process";
import { resolveTemplateVars } from "./builder";
import type {
  CLICommanderPluginInstance,
  CLIExecutionContext,
  FlowTextAgentResult,
  FlowTextPlugin,
} from "../../types";

function getObsidianBin(plugin: CLICommanderPluginInstance): string {
  if (plugin._obsidianBin) {
    return plugin._obsidianBin;
  }

  const isWindows = navigator.platform.includes("Win");

  if (isWindows) {
    const candidates = [
      path.join(process.env.LOCALAPPDATA || "", "Programs", "Obsidian", "Obsidian.com"),
      path.join(process.env.LOCALAPPDATA || "", "Obsidian", "Obsidian.com"),
      path.join(process.env.PROGRAMFILES || "", "Obsidian", "Obsidian.com"),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        plugin._obsidianBin = candidate;
        return candidate;
      }
    }
  } else {
    const candidates = [
      "/Applications/Obsidian.app/Contents/MacOS/obsidian",
      "/usr/local/bin/obsidian",
      "/opt/homebrew/bin/obsidian",
      `${process.env.HOME || ""}/bin/obsidian`,
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        plugin._obsidianBin = candidate;
        return candidate;
      }
    }

    try {
      const resolved = execSync("which obsidian 2>/dev/null", { timeout: 3000 }).toString().trim();
      if (resolved) {
        plugin._obsidianBin = resolved;
        return resolved;
      }
    } catch {
      // Fall back below.
    }
  }

  plugin._obsidianBin = "obsidian";
  return plugin._obsidianBin;
}

function resolveConflictPath(plugin: CLICommanderPluginInstance, targetPath: string): string {
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

function getFlowTextPlugin(plugin: CLICommanderPluginInstance): FlowTextPlugin | null {
  return (plugin.app.plugins?.plugins?.flowtext as FlowTextPlugin | undefined) || null;
}

function parseArg(command: string, key: string): string {
  const quoted = command.match(new RegExp(`\\b${key}="((?:[^"\\\\]|\\\\.)*)"`));
  if (quoted?.[1] !== undefined) {
    return quoted[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  const plain = command.match(new RegExp(`\\b${key}=(\\S+)`));
  return plain?.[1] || "";
}

async function executeAgent(
  plugin: CLICommanderPluginInstance,
  command: string,
  context?: CLIExecutionContext,
): Promise<string> {
  const flowText = getFlowTextPlugin(plugin);
  if (!flowText) {
    throw new Error("FlowText 插件未安装或未启用，无法使用 Agent 功能");
  }
  if (typeof flowText.runAgentTask !== "function") {
    throw new Error("FlowText 插件版本过低，请更新以支持 Agent API");
  }

  const content = parseArg(command, "content");
  if (!content) {
    throw new Error("agent 命令缺少 content 参数，请指定任务描述");
  }

  const filePath = parseArg(command, "path");
  const workflowContext = context?.__workflowContext || "";
  let targetFile: TFile | null = null;

  if (filePath) {
    const abstractFile = plugin.app.vault.getAbstractFileByPath(filePath);
    if (!(abstractFile instanceof TFile)) {
      throw new Error(`文件 "${filePath}" 未找到`);
    }
    targetFile = abstractFile;
  }

  new Notice(`🤖 Agent 处理: ${filePath || content.slice(0, 30)}`);

  while (plugin._agentRunning) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  plugin._agentRunning = true;
  const options: Record<string, unknown> = {
    showPanel: !plugin.app.workspace.getLeavesOfType("flowtext-agent-view")[0],
  };

  if (workflowContext) {
    options.context = workflowContext;
  }
  if (filePath) {
    options.filePath = filePath;
  }

  const workspace = plugin.app.workspace;
  const originalGetActiveFile = workspace.getActiveFile ? workspace.getActiveFile.bind(workspace) : null;

  try {
    if (targetFile && originalGetActiveFile) {
      workspace.getActiveFile = () => targetFile;
    }

    const result = (await flowText.runAgentTask(content, options)) as FlowTextAgentResult;
    if (result?.success) {
      return result.answer || "(Agent 任务完成)";
    }
    throw new Error(result?.answer || "Agent 任务执行失败");
  } finally {
    if (originalGetActiveFile) {
      workspace.getActiveFile = originalGetActiveFile;
    }
    plugin._agentRunning = false;
  }
}

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

  const isWindows = navigator.platform.includes("Win");
  const obsidianPath = getObsidianBin(plugin);
  const binArg =
    obsidianPath !== "obsidian" && (obsidianPath.includes(" ") || obsidianPath.includes("\\"))
      ? `"${obsidianPath}"`
      : obsidianPath;

  const fullCommand = command.replace(/^obsidian\b/, binArg);
  const env = Object.assign({}, process.env, options || {}) as Record<string, string | undefined>;
  const execOptions = {
    timeout: 30_000,
    maxBuffer: 1_048_576,
    encoding: "utf8",
    env,
    cwd: plugin.app.vault.adapter.basePath,
    shell: isWindows ? undefined : "/bin/bash",
  };

  return new Promise((resolve, reject) => {
    exec(fullCommand, execOptions, (error, stdout, stderr) => {
      if (error) {
        const message = stderr.trim() || error.message;
        console.error("[CLI Commander] 命令执行失败:", {
          originalCommand: command,
          fullCommand,
          obsidianPath,
          message,
          stderr,
          error,
        });
        reject(new Error(message.replace(/\s+/g, " ")));
        return;
      }

      const stderrTrim = stderr.trim();
      if (!stdout && stderrTrim && /^Error:/i.test(stderrTrim)) {
        console.error("[CLI Commander] 命令返回错误:", {
          originalCommand: command,
          fullCommand,
          stderr: stderrTrim,
        });
        reject(new Error(stderrTrim.replace(/\s+/g, " ")));
        return;
      }

      resolve(stdout || stderr || "");
    });
  });
}

async function executeOrphansFolder(
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
