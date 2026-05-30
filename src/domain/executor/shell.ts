import { exec } from "child_process";
import { getObsidianBin } from "./obsidian-bin";
import type { CLICommanderPluginInstance, CLIExecutionContext } from "../../types";

export async function executeShellCommand(
  plugin: CLICommanderPluginInstance,
  command: string,
  options?: CLIExecutionContext,
): Promise<string> {
  const isWindows = navigator.platform.includes("Win");
  const obsidianPath = getObsidianBin(plugin);
  const binArg =
    obsidianPath !== "obsidian" && (obsidianPath.includes(" ") || obsidianPath.includes("\\"))
      ? `"${obsidianPath}"`
      : obsidianPath;

  const fullCommand = command.replace(/^obsidian\b/, binArg);
  const env = Object.assign({}, process.env, options || {}) as Record<string, string | undefined>;
  const execOptions = {
    timeout: 30_000,
    maxBuffer: 1_048_576,
    encoding: "utf8",
    env,
    cwd: plugin.app.vault.adapter.basePath,
    shell: isWindows ? undefined : "/bin/bash",
  };

  return new Promise((resolve, reject) => {
    exec(fullCommand, execOptions, (error, stdout, stderr) => {
      if (error) {
        const message = stderr.trim() || error.message;
        console.error("[CLI Commander] 命令执行失败:", {
          originalCommand: command,
          fullCommand,
          obsidianPath,
          message,
          stderr,
          error,
        });
        reject(new Error(message.replace(/\s+/g, " ")));
        return;
      }

      const stderrTrim = stderr.trim();
      if (!stdout && stderrTrim && /^Error:/i.test(stderrTrim)) {
        console.error("[CLI Commander] 命令返回错误:", {
          originalCommand: command,
          fullCommand,
          stderr: stderrTrim,
        });
        reject(new Error(stderrTrim.replace(/\s+/g, " ")));
        return;
      }

      resolve(stdout || stderr || "");
    });
  });
}
