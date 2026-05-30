import { Notice, TFile } from "obsidian";
import { parseArg } from "./args";
import type {
  CLICommanderPluginInstance,
  CLIExecutionContext,
  FlowTextAgentResult,
  FlowTextPlugin,
} from "../../types";

function getFlowTextPlugin(plugin: CLICommanderPluginInstance): FlowTextPlugin | null {
  return (plugin.app.plugins?.plugins?.flowtext as FlowTextPlugin | undefined) || null;
}

export async function executeAgent(
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
