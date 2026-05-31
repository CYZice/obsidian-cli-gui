import { DEFAULT_SETTINGS } from "../../shared/constants/defaults";
import type {
  CLICommanderPluginInstance,
  CLICommanderSettings,
  WorkflowDefinition,
} from "../../types";

export async function loadSettings(plugin: CLICommanderPluginInstance): Promise<CLICommanderSettings> {
  try {
    const data = (await plugin.loadData()) as Partial<CLICommanderSettings> | null;
    const settings = {
      ...DEFAULT_SETTINGS,
      ...(data || {}),
    };
    // Migration: old workflows -> manualWorkflows
    if (data && "workflows" in data && !("manualWorkflows" in data)) {
      const oldWorkflows = (data as { workflows?: WorkflowDefinition[] }).workflows || [];
      settings.manualWorkflows = oldWorkflows;
    }
    // Ensure workflowSources exists
    if (!settings.workflowSources) {
      settings.workflowSources = [];
    }
    return settings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(
  plugin: CLICommanderPluginInstance,
  settings: CLICommanderSettings,
): Promise<void> {
  await plugin.saveData(settings);
}
