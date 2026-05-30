/**
 * 工作流编辑器 Modal
 */
const obsidian = require("obsidian");

class WorkflowEditorModal extends obsidian.Modal {
  constructor(app, plugin, workflow, callback) {
    super(app);
    this._plugin = plugin;
    this._workflow = workflow ? JSON.parse(JSON.stringify(workflow)) : { name: "", steps: [] };
    this._callback = callback;
  }

  onOpen() {
    this.contentEl.empty();
    this.contentEl.addClass("cli-workflow-editor-modal");
    this._render();
  }

  _render() {
    var container = this.contentEl;
    container.empty();

    container.createEl("h3", {
      text: this._workflow.name ? "编辑命令序列" : "新建命令序列",
    });

    var form = container.createDiv({ cls: "cli-save-form" });

    form.createEl("label", { text: "序列名称" });
    let nameInput = form.createEl("input", {
      cls: "cli-param-input",
      attr: {
        type: "text",
        placeholder: "如：早晨工作流",
        value: this._workflow.name,
      },
    });
    nameInput.addEventListener("input", () => {
      this._workflow.name = nameInput.value;
    });

    var stepsSection = form.createDiv({ cls: "cli-wf-steps-section" });
    stepsSection.createEl("label", { text: "步骤列表" });
    stepsSection.createDiv({
      cls: "cli-wf-hint",
      text: "使用 {上一步结果} 或 {prev} 引用上一步的输出",
    });

    this._workflow.steps.forEach((step, index) => {
      var stepRow = stepsSection.createDiv({ cls: "cli-wf-step-row" });
      stepRow.createSpan({ cls: "cli-wf-step-num", text: "" + (index + 1) });

      let cmdInput = stepRow.createEl("input", {
        cls: "cli-param-input cli-wf-step-input",
        attr: { type: "text", value: step.command, placeholder: "obsidian ..." },
      });
      cmdInput.addEventListener("input", () => {
        step.command = cmdInput.value;
      });

      var delBtn = stepRow.createEl("button", { cls: "cli-wf-step-del" });
      obsidian.setIcon(delBtn, "x");
      delBtn.addEventListener("click", () => {
        this._workflow.steps.splice(index, 1);
        this._render();
      });
    });

    var addBtn = stepsSection.createEl("button", { cls: "cli-btn-add" });
    obsidian.setIcon(addBtn, "plus");
    addBtn.createSpan({ text: " 添加步骤" });
    addBtn.addEventListener("click", () => {
      this._workflow.steps.push({ command: "", continueOnError: false });
      this._render();
    });

    var actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });

    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => this.close());

    var saveBtn = actionsDiv.createEl("button", { cls: "cli-btn-exec" });
    obsidian.setIcon(saveBtn, "save");
    saveBtn.createSpan({ text: " 保存" });

    saveBtn.addEventListener("click", () => {
      if (!this._workflow.name.trim()) {
        new obsidian.Notice("请输入序列名称");
      } else if (this._workflow.steps.length === 0) {
        new obsidian.Notice("请至少添加一个步骤");
      } else {
        this._callback(this._workflow);
        this.close();
      }
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

/**
 * 工作流结果 Modal
 */
class WorkflowResultModal extends obsidian.Modal {
  constructor(app, workflowName, results) {
    super(app);
    this._workflowName = workflowName;
    this._results = results;
  }

  onOpen() {
    var container = this.contentEl;
    container.empty();
    container.addClass("cli-wf-result-modal");
    container.createEl("h3", { text: "序列结果: " + this._workflowName });

    this._results.forEach((result) => {
      var item = container.createDiv({
        cls: "cli-wf-result-item " + (result.success ? "" : "is-error"),
      });

      item.createDiv({
        cls: "cli-wf-result-step",
        text: `步骤 ${result.step}: ` + result.command,
      });

      var statusIcon = item.createSpan({ cls: "cli-wf-result-status" });
      obsidian.setIcon(statusIcon, result.success ? "check-circle" : "x-circle");

      item
        .createEl("pre", { cls: "cli-result-modal-pre" })
        .createEl("code", { text: result.result || "(无输出)" });
    });

    container
      .createDiv({ cls: "cli-result-modal-actions" })
      .createEl("button", { text: "关闭", cls: "cli-btn-small" })
      .addEventListener("click", () => this.close());
  }

  onClose() {
    this.contentEl.empty();
  }
}

module.exports = { WorkflowEditorModal, WorkflowResultModal };