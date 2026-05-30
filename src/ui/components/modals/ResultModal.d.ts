import type { App, Modal } from "obsidian";

export class ResultModal extends Modal {
  constructor(app: App, command: string, result: string);
}
