/**
 * 确认对话框 Modal
 */
const obsidian = require("obsidian");

class ConfirmModal extends obsidian.Modal {
  constructor(app, title, message, callback) {
    super(app);
    this._title = title;
    this._message = message;
    this._callback = callback;
  }

  onOpen() {
    var container = this.contentEl;
    container.empty();
    container.addClass("cli-confirm-modal");
    container.createEl("h3", { text: this._title });
    container.createEl("p", { text: this._message, cls: "cli-confirm-message" });

    var actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });

    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => {
        this._callback(false);
        this.close();
      });

    actionsDiv
      .createEl("button", { text: "确认执行", cls: "cli-btn-exec is-danger" })
      .addEventListener("click", () => {
        this._callback(true);
        this.close();
      });
  }

  onClose() {
    this.contentEl.empty();
  }
}

module.exports = { ConfirmModal };