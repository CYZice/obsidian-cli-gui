const { buildCommandString } = require("../../../domain/commands/builder");

const QUICK_INPUT_PARAM_NAMES = [
  "content", "name", "path", "file", "template", "folder", "to", "query",
  "limit", "status", "ref", "line", "filter", "tag", "text", "title", "note",
];

/**
 * 保存预设 Modal
 */
const obsidian = require("obsidian");

class SavePresetModal extends obsidian.Modal {
  constructor(app, cmd, values, callback) {
    super(app);
    this._cmd = cmd;
    this._vals = values;
    this._callback = callback;
  }

  onOpen() {
    var container = this.contentEl;
    container.empty();
    container.addClass("cli-save-preset-modal");
    container.createEl("h3", { text: "保存为预设" });

    var form = container.createDiv({ cls: "cli-save-form" });

    form.createEl("label", { text: "预设名称" });
    let nameInput = form.createEl("input", {
      cls: "cli-param-input",
      attr: {
        type: "text",
        placeholder: "给预设起个名字",
        value: this._cmd.name,
      },
    });

    form.createEl("label", { text: "描述" });
    let descInput = form.createEl("input", {
      cls: "cli-param-input",
      attr: { type: "text", placeholder: "简短描述（可选）" },
    });

    var cmdStr = buildCommandString(this._cmd, this._vals);
    form.createEl("label", { text: "命令" });
    form.createDiv({ cls: "cli-preview-box" }).createEl("code", { text: cmdStr });

    var quickParams = (this._cmd.params || []).filter((p) =>
      QUICK_INPUT_PARAM_NAMES.includes(p.name),
    );
    var checkedParams = new Set();

    if (quickParams.length > 0) {
      form.createEl("label", {
        text: "快捷输入框（卡片上保留的可输入参数）",
        cls: "cli-save-quick-label",
      });
      form
        .createDiv({ cls: "cli-save-quick-hint" })
        .createSpan({
          text: "勾选后，卡片上会显示对应参数的输入框，执行时自动填充。",
        });

      let grid = form.createDiv({ cls: "cli-save-quick-grid" });
      quickParams.forEach((param) => {
        var row = grid.createDiv({ cls: "cli-save-quick-row" });
        let checkbox = row.createEl("input", {
          attr: { type: "checkbox", id: "qi-" + param.name },
        });

        if (
          this._vals[param.name] !== undefined &&
          this._vals[param.name] !== "" &&
          this._vals[param.name] !== false
        ) {
          checkbox.checked = true;
          checkedParams.add(param.name);
        }

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) checkedParams.add(param.name);
          else checkedParams.delete(param.name);
        });

        var label = row.createEl("label", { attr: { for: "qi-" + param.name } });
        label.createSpan({
          cls: "cli-save-quick-pname",
          text: param.label || param.name,
        });
        label.createSpan({
          cls: "cli-save-quick-ptype",
          text: ` (${param.type === "textarea" ? "textarea" : "input"})`,
        });
      });
    }

    var actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });

    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => this.close());

    var saveBtn = actionsDiv.createEl("button", { cls: "cli-btn-exec" });
    obsidian.setIcon(saveBtn, "save");
    saveBtn.createSpan({ text: " 保存" });

    saveBtn.addEventListener("click", () => {
      var quickInputs = null;
      if (checkedParams.size > 0) {
        quickInputs = quickParams
          .filter((p) => checkedParams.has(p.name))
          .map((p) => ({
            param: p.name,
            label: p.label || p.name,
            type: p.type === "textarea" ? "textarea" : "input",
            placeholder: p.placeholder || `输入${p.label || p.name}...`,
          }));
      }

      this._callback({
        name: nameInput.value || this._cmd.name,
        desc: descInput.value,
        lucideIcon: "zap",
        commandId: this._cmd.id,
        command: cmdStr,
        params: { ...this._vals },
        quickInputs: quickInputs,
        createdAt: Date.now(),
      });
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

module.exports = { SavePresetModal };