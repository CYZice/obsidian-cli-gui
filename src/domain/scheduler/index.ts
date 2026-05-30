import { Notice } from "obsidian";
import { VIEW_TYPE } from "../../ui/views/CLICommanderView";
import type { CLICommanderPluginInstance, WorkflowDefinition, WorkspaceWithViewLeaf } from "../../types";

export function startScheduler(plugin: CLICommanderPluginInstance): void {
  if (plugin._schedTimer) {
    clearInterval(plugin._schedTimer);
  }

  plugin._schedTimer = setInterval(() => {
    void checkSchedules(plugin);
  }, 60_000);
}

export async function checkSchedules(plugin: CLICommanderPluginInstance): Promise<void> {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dayOfWeek = now.getDay();

  for (const workflow of plugin.settings.workflows || []) {
    const schedule = workflow.schedule;
    if (!schedule?.enabled) {
      continue;
    }

    let shouldRun = false;
    if (schedule.type === "daily") {
      shouldRun = schedule.time === timeStr;
    } else if (schedule.type === "weekly") {
      shouldRun = schedule.weekday === dayOfWeek && schedule.time === timeStr;
    } else if (schedule.type === "interval") {
      const interval = schedule.intervalMin || 60;
      const minutes = now.getHours() * 60 + now.getMinutes();
      shouldRun = minutes % interval === 0;
    }

    if (!shouldRun) {
      continue;
    }

    const runKey = `${workflow.name}_${timeStr}_${now.toDateString()}`;
    plugin._schedRan ||= new Set<string>();
    if (plugin._schedRan.has(runKey)) {
      continue;
    }

    plugin._schedRan.add(runKey);
    if (plugin._schedRan.size > 200) {
      plugin._schedRan.clear();
    }

    new Notice(`⏰ 定时执行序列：${workflow.name}`);

    try {
      const { combined, success } = await plugin.runWorkflow(workflow);
      const viewLeaf = plugin.app.workspace.getLeavesOfType(VIEW_TYPE)[0] as WorkspaceWithViewLeaf | undefined;
      const view = viewLeaf?.view;
      if (view) {
        view._showResult(combined, !success);
        view._addHistory(
          workflow.steps.map((step) => step.label || step.command).join(" → "),
          { id: "workflow", name: `序列: ${workflow.name}` },
          combined,
          success,
          workflow,
        );
      } else {
        new Notice(success ? `✅ 序列「${workflow.name}」执行完成` : `⚠️ 序列「${workflow.name}」部分步骤失败`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`❌ 定时序列「${workflow.name}」执行失败: ${message}`);
    }
  }
}
