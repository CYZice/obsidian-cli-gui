import path from "path";
import fs from "fs";
import { execSync } from "child_process";
import type { CLICommanderPluginInstance } from "../../types";

export function getObsidianBin(plugin: CLICommanderPluginInstance): string {
  if (plugin._obsidianBin) {
    return plugin._obsidianBin;
  }

  const isWindows = navigator.platform.includes("Win");

  if (isWindows) {
    const candidates = [
      path.join(process.env.LOCALAPPDATA || "", "Programs", "Obsidian", "Obsidian.com"),
      path.join(process.env.LOCALAPPDATA || "", "Obsidian", "Obsidian.com"),
      path.join(process.env.PROGRAMFILES || "", "Obsidian", "Obsidian.com"),
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        plugin._obsidianBin = candidate;
        return candidate;
      }
    }
  } else {
    const candidates = [
      "/Applications/Obsidian.app/Contents/MacOS/obsidian",
      "/usr/local/bin/obsidian",
      "/opt/homebrew/bin/obsidian",
      `${process.env.HOME || ""}/bin/obsidian`,
    ];

    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        plugin._obsidianBin = candidate;
        return candidate;
      }
    }

    try {
      const resolved = execSync("which obsidian 2>/dev/null", { timeout: 3000 }).toString().trim();
      if (resolved) {
        plugin._obsidianBin = resolved;
        return resolved;
      }
    } catch {
      // Fall back below.
    }
  }

  plugin._obsidianBin = "obsidian";
  return plugin._obsidianBin;
}
