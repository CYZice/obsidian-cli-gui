import { Notice } from "obsidian";
import type { CLICommanderPluginInstance, WorkflowDefinition, WorkflowRunResult, WorkflowRunResultItem } from "../../types";
import { executeBatchStep } from "./batch";
import { buildWorkflowContext, isPrevWriteCommand, applyPrevToCommand } from "./context";
import { executeEvalStep } from "./eval";
import { executePrevWrite } from "./write";

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
    const context = buildWorkflowContext(command, index, results);

    if (step.batchMode && rawPrev) {
      const batch = await executeBatchStep(plugin, step, rawPrev, index, workflow.steps.length);
      prevResult = batch.result;
      results.push({
        step: index + 1,
        command: step.command,
        result: batch.result,
        success: batch.success,
      });
    } else if (usesPrev && isPrevWriteCommand(command)) {
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
        command = applyPrevToCommand(command, rawPrev);
      }

      new Notice(`步骤 ${index + 1}/${workflow.steps.length}: ${step.label || step.command}`);

      try {
        const output = step.isEval
          ? await executeEvalStep(plugin, command, rawPrev)
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
