import { Modal, Notice } from "obsidian";
import type { CLICommanderPluginInstance } from "../../../types";

export class QuickInputModal extends Modal {
  private readonly plugin: CLICommanderPluginInstance;
  private readonly titleText: string;
  private readonly placeholder: string;
  private readonly callback: (value: string) => void | Promise<void>;

  constructor(
    app: Modal["app"],
    plugin: CLICommanderPluginInstance,
    title: string,
    placeholder: string,
    callback: (value: string) => void | Promise<void>,
  ) {
    super(app);
    this.plugin = plugin;
    this.titleText = title;
    this.placeholder = placeholder;
    this.callback = callback;
  }

  onOpen(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("cli-quick-modal");
    container.createEl("h3", { text: this.titleText });

    const input = container.createEl("input", {
      cls: "cli-param-input cli-quick-input",
      attr: { type: "text", placeholder: this.placeholder },
    });
    input.focus();

    const actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });
    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => this.close());

    const execBtn = actionsDiv.createEl("button", { cls: "cli-btn-exec" });
    execBtn.createSpan({ text: " 执行" });
    require("obsidian").setIcon(execBtn, "play");

    const execute = () => {
      const value = input.value.trim();
      if (!value) {
        new Notice("请输入内容");
        return;
      }

      void this.callback(value);
      this.close();
    };

    execBtn.addEventListener("click", execute);
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        execute();
      }
    });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
