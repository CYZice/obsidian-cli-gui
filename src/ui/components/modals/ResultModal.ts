import { Modal, Notice, setIcon } from "obsidian";

export class ResultModal extends Modal {
  private readonly command: string;
  private readonly result: string;

  constructor(app: Modal["app"], command: string, result: string) {
    super(app);
    this.command = command;
    this.result = result;
  }

  onOpen(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("cli-result-modal");
    container.createEl("h3", { text: "执行结果" });
    container.createDiv({ cls: "cli-result-modal-cmd", text: this.command });
    container
      .createEl("pre", { cls: "cli-result-modal-pre" })
      .createEl("code", { text: this.result || "(无输出)" });

    const actionsDiv = container.createDiv({ cls: "cli-result-modal-actions" });
    const copyBtn = actionsDiv.createEl("button", { cls: "cli-btn-small" });
    setIcon(copyBtn, "clipboard");
    copyBtn.createSpan({ text: " 复制结果" });
    copyBtn.addEventListener("click", () => {
      void navigator.clipboard.writeText(this.result);
      new Notice("已复制");
    });

    actionsDiv
      .createEl("button", { text: "关闭", cls: "cli-btn-small" })
      .addEventListener("click", () => this.close());
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
