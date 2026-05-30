import { DEFAULT_SETTINGS } from "../../shared/constants/defaults";
import type { CLICommanderPluginInstance, CLICommanderSettings } from "../../types";

export async function loadSettings(plugin: CLICommanderPluginInstance): Promise<CLICommanderSettings> {
  try {
    const data = (await plugin.loadData()) as Partial<CLICommanderSettings> | null;
    return {
      ...DEFAULT_SETTINGS,
      ...(data || {}),
    };
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
