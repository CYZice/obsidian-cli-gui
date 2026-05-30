/**
 * 工作流执行器
 */
const { resolveTemplateVars } = require("../domain/commands/builder");
const obsidian = require("obsidian");

/**
 * 执行工作流
 * @param {object} workflow - 工作流定义
 * @returns {Promise<{combined: string, success: boolean, results: Array}>}
 */
async function runWorkflow(workflow) {
  var results = [];
  let prevResult = "";
  var isWin = navigator.platform.indexOf("Win") !== -1;

  for (let i = 0; i < workflow.steps.length; i++) {
    let step = workflow.steps[i];
    var usesPrev = /\{上一步结果\}|\{prev\}/.test(step.command);
    let cmd = step.command;

    var context = {};
    if (/^obsidian\s+agent\b/.test(cmd)) {
      var contextParts = [];
      for (let j = 0; j < i; j++) {
        var prev = results[j];
        if (prev) {
          contextParts.push(
            `步骤${prev.step}: ${prev.command}\n结果: ${(prev.result || "(无输出)").substring(0, 2000)}`,
          );
        }
      }
      if (contextParts.length > 0) context.__workflowContext = contextParts.join("\n\n");
    }

    // 处理批量模式
    if (step.batchMode && prevResult.trim()) {
      var lines = prevResult.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length > 0) {
        new obsidian.Notice(
          `步骤 ${i + 1}/${workflow.steps.length}: 批量执行 ${lines.length} 项`,
        );
        var batchResults = [];
        var vault = this.app.vault;

        for (var line of lines) {
          let batchCmd = step.command
            .replace(/\{file\}/g, line)
            .replace(/\{上一步结果\}/g, line)
            .replace(/\{prev\}/g, line);

          try {
            var q = await this.executeCLI(batchCmd);
            var P = q ? q.trim() : "";
            if (P && /^Error:/i.test(P)) {
              batchResults.push(`❌ ${line}: ${P}`);
              if (!step.continueOnError) break;
            } else {
              batchResults.push("✅ " + line + (P ? ": " + P : ""));
            }
          } catch (e) {
            batchResults.push(`❌ ${line}: ${e.message}`);
            if (!step.continueOnError) break;
          }
        }

        prevResult = batchResults.join("\n");
        results.push({
          step: i + 1,
          command: step.command,
          result: prevResult,
          success: !batchResults.some((r) => r.startsWith("❌")),
        });
      }
    } else {
      // 普通模式
      var isDailyWrite = usesPrev && cmd.match(/^obsidian\s+(daily:append|daily:prepend|append|prepend)\b/);

      if (usesPrev && isDailyWrite) {
        try {
          var writeResult = await this._pluginExecPrevWrite(cmd, prevResult);
          prevResult = writeResult;
          results.push({
            step: i + 1,
            command: step.command,
            result: writeResult,
            success: true,
          });
        } catch (e) {
          results.push({
            step: i + 1,
            command: step.command,
            result: e.message,
            success: false,
          });
          if (!step.continueOnError) break;
        }
      } else {
        new obsidian.Notice(`步骤 ${i + 1}/${workflow.steps.length}: ${step.label || step.command.slice(0, 30)}`);
        try {
          var result = await this.executeCLI(cmd, context);
          prevResult = result || "";
          results.push({
            step: i + 1,
            command: step.command,
            result: prevResult,
            success: true,
          });
        } catch (e) {
          prevResult = e.message;
          results.push({
            step: i + 1,
            command: step.command,
            result: e.message,
            success: false,
          });
          if (!step.continueOnError) break;
        }
      }
    }

    // 步骤间延时
    if (step.sleep && i < workflow.steps.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, step.sleep));
    }
  }

  var combined = results.map((r) => `[步骤${r.step}] ${r.command}\n${r.result}`).join("\n\n");
  var success = results.every((r) => r.success);

  return { combined, success, results };
}

/**
 * 执行带前一步结果的写入操作
 */
async function _pluginExecPrevWrite(cmd, prevResult) {
  var dailyMatch = cmd.match(/^obsidian\s+(daily:append|daily:prepend)\b/);
  var fileMatch = cmd.match(/^obsidian\s+(append|prepend)\b/);

  if (dailyMatch || fileMatch) {
    var action = dailyMatch ? dailyMatch[1] : fileMatch[1];
    var contentParam = prevResult;
    var inlineParam = /inline/.test(cmd);

    var dailyNote = this.app.vault.getNewFile?.();
    if (!dailyNote) {
      var now = new Date();
      var dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      var dailyPath = dateStr + ".md";
      dailyNote = this.app.vault.getAbstractFileByPath(dailyPath);
      if (!dailyNote) {
        dailyNote = await this.app.vault.create(dailyPath, "");
      }
    }

    if (dailyNote) {
      var existing = await this.app.vault.read(dailyNote);
      var newContent = action === "daily:append" || action === "append"
        ? (inlineParam ? existing + contentParam : existing + "\n" + contentParam)
        : (inlineParam ? contentParam + existing : contentParam + "\n" + existing);
      await this.app.vault.modify(dailyNote, newContent);
      return "写入成功";
    }
  }

  throw new Error("不支持的前一步结果写入类型");
}

module.exports = { runWorkflow, _pluginExecPrevWrite };