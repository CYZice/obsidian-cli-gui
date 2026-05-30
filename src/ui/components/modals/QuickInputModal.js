/**
 * 快速输入 Modal
 */
const obsidian = require("obsidian");

class QuickInputModal extends obsidian.Modal {
  constructor(app, plugin, title, placeholder, callback) {
    super(app);
    this._plugin = plugin;
    this._title = title;
    this._placeholder = placeholder;
    this._callback = callback;
  }

  onOpen() {
    var container = this.contentEl;
    container.empty();
    container.addClass("cli-quick-modal");
    container.createEl("h3", { text: this._title });

    let input = container.createEl("input", {
      cls: "cli-param-input cli-quick-input",
      attr: { type: "text", placeholder: this._placeholder },
    });
    input.focus();

    var actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });

    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => this.close());

    var execBtn = actionsDiv.createEl("button", { cls: "cli-btn-exec" });
    obsidian.setIcon(execBtn, "play");
    execBtn.createSpan({ text: " 执行" });

    let execute = () => {
      var value = input.value.trim();
      if (value) {
        this._callback(value);
        this.close();
      } else {
        new obsidian.Notice("请输入内容");
      }
    };

    execBtn.addEventListener("click", execute);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") execute();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

module.exports = { QuickInputModal };