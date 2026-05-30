import type { App, Modal } from "obsidian";
import type { WorkflowDefinition, WorkflowRunResultItem } from "../../../types";

export class WorkflowEditorModal extends Modal {
  constructor(
    app: App,
    plugin: unknown,
    workflow: WorkflowDefinition | null,
    callback: (workflow: WorkflowDefinition) => void,
  );
}

export class WorkflowResultModal extends Modal {
  constructor(app: App, workflowName: string, results: WorkflowRunResultItem[]);
}
