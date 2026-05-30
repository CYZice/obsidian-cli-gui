import type { App, Modal } from "obsidian";
import type { CLICommanderPluginInstance } from "../../../types";

export class QuickInputModal extends Modal {
  constructor(
    app: App,
    plugin: CLICommanderPluginInstance,
    title: string,
    placeholder: string,
    callback: (value: string) => void | Promise<void>,
  );
}
