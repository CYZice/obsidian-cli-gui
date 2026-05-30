import { Modal } from "obsidian";

export class ConfirmModal extends Modal {
  private readonly title: string;
  private readonly message: string;
  private readonly callback: (confirmed: boolean) => void;

  constructor(app: Modal["app"], title: string, message: string, callback: (confirmed: boolean) => void) {
    super(app);
    this.title = title;
    this.message = message;
    this.callback = callback;
  }

  onOpen(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass("cli-confirm-modal");
    container.createEl("h3", { text: this.title });
    container.createEl("p", { text: this.message, cls: "cli-confirm-message" });

    const actionsDiv = container.createDiv({ cls: "cli-confirm-actions" });
    actionsDiv
      .createEl("button", { text: "取消", cls: "cli-btn-cancel" })
      .addEventListener("click", () => {
        this.callback(false);
        this.close();
      });

    actionsDiv
      .createEl("button", { text: "确认执行", cls: "cli-btn-exec is-danger" })
      .addEventListener("click", () => {
        this.callback(true);
        this.close();
      });
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
