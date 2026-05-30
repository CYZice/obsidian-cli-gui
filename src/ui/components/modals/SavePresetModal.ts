import { Modal, setIcon } from "obsidian";
import { buildCommandString } from "../../../domain/commands/builder";
import type { CLICommandDefinition, SavePresetPayload } from "../../../types";

const QUICK_INPUT_PARAM_NAMES = [
  "content",
  "name",
  "path",
  "file",
  "template",
  "folder",
  "to",
  "query",
  "limit",
  "status",
  "ref",
  "line",
  "filter",
  "tag",
  "text",
  "title",
  "note",
];

export class SavePresetModal extends Modal {
  private readonly command: CLICommandDefinition;
  private readonly values: Record<string, unknown>;
  private readonly callback: (payload: SavePresetPayload) => void;

  constructor(
    app: Modal["app"],
    command: CLICommandDefinition,
    values: Record<string, unknown>,
    callback: (payload: SavePresetPayload) => void,
  ) {
    super(app);
    this.command = command;
    this.values = values;
    this.callback = callback;
  }

  onOpen(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("cli-save-preset-modal");
    container.createEl("h3", { text: "保存为预设" });

    const form = container.createDiv({ cls: "cli-save-form" });
    form.createEl("label", { text: "预设名称" });
    const nameInput = form.createEl("input", {
      cls: "cli-param-input",
      attr: {
        type: "text",
        placeholder: "给预设起个名字",
        value: this.command.name,
      },
    });

    form.createEl("label", { text: "描述" });
    const descInput = form.createEl("input", {
      cls: "cli-param-input",
      attr: { type: "text", placeholder: "简短描述（可选）" },
    });

    const commandString = buildCommandString(this.command, this.values);
    form.createEl("label", { text: "命令" });
    form.createDiv({ cls: "cli-preview-box" }).createEl("code", { text: commandString });

    const quickParams = (this.command.params || []).filter((param) =>
      QUICK_INPUT_PARAM_NAMES.includes(param.name),
    );
    const checkedParams = new Set<string>();

    if (quickParams.length > 0) {
      form.createEl("label", {
        text: "快捷输入框（卡片上保留的可输入参数）",
        cls: "cli-save-quick-label",
      });
      form
        .createDiv({ cls: "cli-save-quick-hint" })
        .createSpan({ text: "勾选后，卡片上会显示对应参数的输入框，执行时自动填充。" });

      const grid = form.createDiv({ cls: "cli-save-quick-grid" });
      quickParams.forEach((param) => {
        const row = grid.createDiv({ cls: "cli-save-quick-row" });
        const checkbox = row.createEl("input", {
          attr: { type: "checkbox", id: `qi-${param.name}` },
        });

        if (this.values[param.name] !== undefined && this.values[param.name] !== "" && this.values[param.name] !== false) {
          checkbox.checked = true;
          checkedParams.add(param.name);
        }

        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            checkedParams.add(param.name);
          } else {
            checkedParams.delete(param.name);
          }
        });

        const label = row.createEl("label", { attr: { for: `qi-${param.name}` } });
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

    const actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });
    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => this.close());

    const saveBtn = actionsDiv.createEl("button", { cls: "cli-btn-exec" });
    setIcon(saveBtn, "save");
    saveBtn.createSpan({ text: " 保存" });

    saveBtn.addEventListener("click", () => {
      let quickInputs = null;
      if (checkedParams.size > 0) {
        quickInputs = quickParams
          .filter((param) => checkedParams.has(param.name))
          .map((param) => ({
            param: param.name,
            label: param.label || param.name,
            type: (param.type === "textarea" ? "textarea" : "input") as "textarea" | "input",
            placeholder: param.placeholder || `输入${param.label || param.name}...`,
          }));
      }

      this.callback({
        name: nameInput.value || this.command.name,
        desc: descInput.value,
        lucideIcon: "zap",
        commandId: this.command.id,
        command: commandString,
        params: { ...this.values },
        quickInputs,
        createdAt: Date.now(),
      });
      this.close();
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
