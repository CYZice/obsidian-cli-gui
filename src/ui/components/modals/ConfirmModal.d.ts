import type { App, Modal } from "obsidian";

export class ConfirmModal extends Modal {
  constructor(app: App, title: string, message: string, callback: (confirmed: boolean) => void);
}
