import { Modal, Notice, setIcon } from "obsidian";
import type { CLICommanderPluginInstance, WorkflowDefinition } from "../../../types";

export class WorkflowEditorModal extends Modal {
  private readonly plugin: CLICommanderPluginInstance;
  private readonly workflow: WorkflowDefinition;
  private readonly callback: (workflow: WorkflowDefinition) => void;

  constructor(
    app: Modal["app"],
    plugin: CLICommanderPluginInstance,
    workflow: WorkflowDefinition | null,
    callback: (workflow: WorkflowDefinition) => void,
  ) {
    super(app);
    this.plugin = plugin;
    this.workflow = workflow ? JSON.parse(JSON.stringify(workflow)) : { name: "", steps: [] };
    this.callback = callback;
  }

  onOpen(): void {
    this.contentEl.empty();
    this.contentEl.addClass("cli-workflow-editor-modal");
    this.render();
  }

  private render(): void {
    const container = this.contentEl;
    container.empty();
    container.createEl("h3", {
      text: this.workflow.name ? "编辑命令序列" : "新建命令序列",
    });

    const form = container.createDiv({ cls: "cli-save-form" });
    form.createEl("label", { text: "序列名称" });
    const nameInput = form.createEl("input", {
      cls: "cli-param-input",
      attr: {
        type: "text",
        placeholder: "如：早晨工作流",
        value: this.workflow.name,
      },
    });
    nameInput.addEventListener("input", () => {
      this.workflow.name = nameInput.value;
    });

    const stepsSection = form.createDiv({ cls: "cli-wf-steps-section" });
    stepsSection.createEl("label", { text: "步骤列表" });
    stepsSection.createDiv({
      cls: "cli-wf-hint",
      text: "使用 {上一步结果} 或 {prev} 引用上一步的输出",
    });

    this.workflow.steps.forEach((step, index) => {
      const stepRow = stepsSection.createDiv({ cls: "cli-wf-step-row" });
      stepRow.createSpan({ cls: "cli-wf-step-num", text: `${index + 1}` });

      const cmdInput = stepRow.createEl("input", {
        cls: "cli-param-input cli-wf-step-input",
        attr: { type: "text", value: step.command, placeholder: "obsidian ..." },
      });
      cmdInput.addEventListener("input", () => {
        step.command = cmdInput.value;
      });

      const delBtn = stepRow.createEl("button", { cls: "cli-wf-step-del" });
      setIcon(delBtn, "x");
      delBtn.addEventListener("click", () => {
        this.workflow.steps.splice(index, 1);
        this.render();
      });
    });

    const addBtn = stepsSection.createEl("button", { cls: "cli-btn-add" });
    setIcon(addBtn, "plus");
    addBtn.createSpan({ text: " 添加步骤" });
    addBtn.addEventListener("click", () => {
      this.workflow.steps.push({ command: "", continueOnError: false });
      this.render();
    });

    const actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });
    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => this.close());

    const saveBtn = actionsDiv.createEl("button", { cls: "cli-btn-exec" });
    setIcon(saveBtn, "save");
    saveBtn.createSpan({ text: " 保存" });
    saveBtn.addEventListener("click", () => {
      if (!this.workflow.name.trim()) {
        new Notice("请输入序列名称");
      } else if (this.workflow.steps.length === 0) {
        new Notice("请至少添加一个步骤");
      } else {
        this.callback(this.workflow);
        this.close();
      }
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
