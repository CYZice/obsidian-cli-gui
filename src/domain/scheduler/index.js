/**
 * 调度器
 * 定时检查并执行工作流
 */

const obsidian = require("obsidian");
const { VIEW_TYPE } = require("../../ui/views/CLICommanderView");

/**
 * 启动定时调度器
 * @param {object} plugin - 插件实例
 */
function startScheduler(plugin) {
  if (plugin._schedTimer) clearInterval(plugin._schedTimer);
  plugin._schedTimer = setInterval(() => checkSchedules(plugin), 6e4);
}

/**
 * 检查并执行定时任务
 * @param {object} plugin - 插件实例
 */
async function checkSchedules(plugin) {
  var now = new Date();
  var timeStr =
    String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
  var dayOfWeek = now.getDay();

  for (var workflow of plugin.settings.workflows || []) {
    var schedule = workflow.schedule;
    if (schedule && schedule.enabled) {
      let shouldRun = false;
      if (schedule.type === "daily") {
        shouldRun = schedule.time === timeStr;
      } else if (schedule.type === "weekly") {
        shouldRun = schedule.weekday === dayOfWeek && schedule.time === timeStr;
      } else if (schedule.type === "interval") {
        let interval = schedule.intervalMin || 60;
        let minutes = 60 * now.getHours() + now.getMinutes();
        shouldRun = minutes % interval === 0;
      }

      if (shouldRun) {
        let runKey = workflow.name + `_${timeStr}_` + now.toDateString();
        if (!plugin._schedRan || !plugin._schedRan.has(runKey)) {
          plugin._schedRan = plugin._schedRan || new Set();
          plugin._schedRan.add(runKey);
          if (plugin._schedRan.size > 200) plugin._schedRan.clear();

          new obsidian.Notice("⏰ 定时执行序列：" + workflow.name);
          try {
            var { combined, success } = await plugin.runWorkflow(workflow);
            var view = plugin.app.workspace.getLeavesOfType(VIEW_TYPE)[0]?.view;
            if (view) {
              view._showResult(combined, !success);
              view._addHistory(
                workflow.steps.map((s) => s.label || s.command).join(" → "),
                { id: "workflow", name: "序列: " + workflow.name },
                combined,
                success,
                workflow,
              );
            } else {
              new obsidian.Notice(
                success
                  ? `✅ 序列「${workflow.name}」执行完成`
                  : `⚠️ 序列「${workflow.name}」部分步骤失败`,
              );
            }
          } catch (err) {
            new obsidian.Notice(`❌ 定时序列「${workflow.name}」执行失败: ` + err.message);
          }
        }
      }
    }
  }
}

module.exports = { startScheduler, checkSchedules };
