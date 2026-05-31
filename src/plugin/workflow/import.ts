import { TFile } from "obsidian";
import type {
  CLICommanderPluginInstance,
  WorkflowDefinition,
  WorkflowSourceDefinition,
  ImportedWorkflowFile,
} from "../../types";

export async function importWorkflowsFromFile(
  plugin: CLICommanderPluginInstance,
  filePath: string
): Promise<{ workflows: WorkflowDefinition[]; error?: string }> {
  try {
    const file = plugin.app.vault.getAbstractFileByPath(filePath);
    if (!file || !(file instanceof TFile)) {
      return { workflows: [], error: `File not found: ${filePath}` };
    }

    let content: string;
    try {
      content = await plugin.app.vault.read(file);
    } catch {
      return { workflows: [], error: `Cannot read file: ${filePath}` };
    }

    let parsed: ImportedWorkflowFile;
    try {
      parsed = JSON.parse(content);
    } catch {
      return { workflows: [], error: `Invalid JSON: ${filePath}` };
    }

    if (!Array.isArray(parsed.workflows)) {
      return { workflows: [], error: `Invalid format: workflows array expected` };
    }

    const validWorkflows: WorkflowDefinition[] = parsed.workflows.filter(
      (w): w is WorkflowDefinition =>
        typeof w === "object" && w !== null && typeof w.name === "string" && Array.isArray(w.steps)
    );

    return { workflows: validWorkflows };
  } catch (err) {
    return { workflows: [], error: String(err) };
  }
}

export async function exportWorkflowsToFile(
  plugin: CLICommanderPluginInstance,
  filePath: string,
  options?: { source?: "manual" | "all" }
): Promise<void> {
  const source = options?.source ?? "all";
  const workflows: WorkflowDefinition[] =
    source === "manual"
      ? plugin.settings.manualWorkflows
      : plugin.getAllWorkflows();

  const content = JSON.stringify({ workflows }, null, 2);
  const file = plugin.app.vault.getAbstractFileByPath(filePath);

  if (file instanceof TFile) {
    await plugin.app.vault.modify(file, content);
  } else {
    await plugin.app.vault.create(filePath, content);
  }
}