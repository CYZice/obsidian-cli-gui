import type { App, Modal } from "obsidian";
import type { CLICommandDefinition, SavePresetPayload } from "../../../types";

export class SavePresetModal extends Modal {
  constructor(
    app: App,
    command: CLICommandDefinition,
    values: Record<string, unknown>,
    callback: (payload: SavePresetPayload) => void,
  );
}
