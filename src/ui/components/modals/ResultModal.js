/**
 * 结果展示 Modal
 */
const obsidian = require("obsidian");

class ResultModal extends obsidian.Modal {
  constructor(app, command, result) {
    super(app);
    this._command = command;
    this._result = result;
  }

  onOpen() {
    var container = this.contentEl;
    container.empty();
    container.addClass("cli-result-modal");
    container.createEl("h3", { text: "执行结果" });
    container.createDiv({ cls: "cli-result-modal-cmd", text: this._command });
    container
      .createEl("pre", { cls: "cli-result-modal-pre" })
      .createEl("code", { text: this._result || "(无输出)" });

    var actionsDiv = container.createDiv({ cls: "cli-result-modal-actions" });

    var copyBtn = actionsDiv.createEl("button", { cls: "cli-btn-small" });
    obsidian.setIcon(copyBtn, "clipboard");
    copyBtn.createSpan({ text: " 复制结果" });
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(this._result);
      new obsidian.Notice("已复制");
    });

    actionsDiv
      .createEl("button", { text: "关闭", cls: "cli-btn-small" })
      .addEventListener("click", () => this.close());
  }

  onClose() {
    this.contentEl.empty();
  }
}

module.exports = { ResultModal };