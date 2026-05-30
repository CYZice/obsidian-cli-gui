import { Notice, TFile } from "obsidian";
import { parseArg } from "./args";
import type {
  CLICommanderPluginInstance,
  CLIExecutionContext,
  RunAgentTaskOptions,
  RunAgentTaskResult,
  YoloPlugin,
} from "../../types";

function getYoloPlugin(plugin: CLICommanderPluginInstance): YoloPlugin | null {
  return (plugin.app.plugins?.plugins?.yolo as YoloPlugin | undefined) || null;
}

export async function executeAgent(
  plugin: CLICommanderPluginInstance,
  command: string,
  context?: CLIExecutionContext,
): Promise<string> {
  const yolo = getYoloPlugin(plugin);
  if (!yolo) {
    throw new Error("Yolo 插件未安装或未启用，无法使用 Agent 功能");
  }
  if (typeof yolo.runAgentTask !== "function") {
    throw new Error("Yolo 插件版本过低，请更新以支持 runAgentTask API");
  }

  const content = parseArg(command, "content");
  if (!content) {
    throw new Error("agent 命令缺少 content 参数，请指定任务描述");
  }

  const filePath = parseArg(command, "filePath") || parseArg(command, "path");
  const folderPath = parseArg(command, "folderPath") || parseArg(command, "folder");
  const assistantId = parseArg(command, "assistantId");
  let targetFile: TFile | null = null;

  if (filePath) {
    const abstractFile = plugin.app.vault.getAbstractFileByPath(filePath);
    if (!(abstractFile instanceof TFile)) {
      throw new Error(`文件 "${filePath}" 未找到`);
    }
    targetFile = abstractFile;
  }

  new Notice(`🤖 Agent 处理: ${filePath || folderPath || content.slice(0, 30)}`);

  while (plugin._agentRunning) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  plugin._agentRunning = true;
  const options: RunAgentTaskOptions = {};
  if (filePath) {
    options.filePath = filePath;
  }
  if (folderPath) {
    options.folderPath = folderPath;
  }
  if (assistantId) {
    options.assistantId = assistantId;
  }

  const workspace = plugin.app.workspace;
  const originalGetActiveFile = workspace.getActiveFile ? workspace.getActiveFile.bind(workspace) : null;

  try {
    if (targetFile && originalGetActiveFile) {
      workspace.getActiveFile = () => targetFile;
    }

    const result = (await yolo.runAgentTask(content, options)) as RunAgentTaskResult;
    if (result?.success) {
      return result.message || "(Agent 任务完成)";
    }
    throw new Error(result?.message || "Agent 任务执行失败");
  } finally {
    if (originalGetActiveFile) {
      workspace.getActiveFile = originalGetActiveFile;
    }
    plugin._agentRunning = false;
  }
}
