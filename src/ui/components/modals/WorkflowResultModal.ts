import { Modal, setIcon } from "obsidian";
import type { WorkflowRunResultItem } from "../../../types";

export class WorkflowResultModal extends Modal {
  private readonly workflowName: string;
  private readonly results: WorkflowRunResultItem[];

  constructor(app: Modal["app"], workflowName: string, results: WorkflowRunResultItem[]) {
    super(app);
    this.workflowName = workflowName;
    this.results = results;
  }

  onOpen(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("cli-wf-result-modal");
    container.createEl("h3", { text: `序列结果: ${this.workflowName}` });

    this.results.forEach((result) => {
      const item = container.createDiv({
        cls: `cli-wf-result-item ${result.success ? "" : "is-error"}`,
      });
      item.createDiv({
        cls: "cli-wf-result-step",
        text: `步骤 ${result.step}: ${result.command}`,
      });

      const statusIcon = item.createSpan({ cls: "cli-wf-result-status" });
      setIcon(statusIcon, result.success ? "check-circle" : "x-circle");
      item
        .createEl("pre", { cls: "cli-result-modal-pre" })
        .createEl("code", { text: result.result || "(无输出)" });
    });

    container
      .createDiv({ cls: "cli-result-modal-actions" })
      .createEl("button", { text: "关闭", cls: "cli-btn-small" })
      .addEventListener("click", () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
