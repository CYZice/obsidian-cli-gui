const obsidian = require("obsidian");

async function runWorkflow(workflow) {
  const results = [];
  let prevResult = "";

  for (let i = 0; i < workflow.steps.length; i++) {
    const step = workflow.steps[i];
    const rawPrev = prevResult.trim();
    const usesPrev = /\{上一步结果\}|\{prev\}/.test(step.command);
    let command = step.command;
    const context = {};

    if (/^obsidian\s+agent\b/.test(command)) {
      const contextParts = [];
      for (let j = 0; j < i; j++) {
        const prev = results[j];
        if (prev) {
          contextParts.push(
            `步骤${prev.step}: ${prev.command}\n结果: ${(prev.result || "(无输出)").substring(0, 2000)}`,
          );
        }
      }
      if (contextParts.length > 0) {
        context.__workflowContext = contextParts.join("\n\n");
      }
    }

    if (step.batchMode && rawPrev) {
      const lines = rawPrev
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      new obsidian.Notice(`步骤 ${i + 1}/${workflow.steps.length}: 批量执行 ${lines.length} 项`);

      const vault = this.app.vault;
      const moveMatch = step.command.match(/^obsidian\s+move\b.*?\bto=("([^"]*)"|([^\s"]+))/);
      if (moveMatch) {
        const moveTarget = moveMatch[2] !== undefined ? moveMatch[2] : moveMatch[3];
        let current = "";
        for (const segment of moveTarget.split("/")) {
          current = current ? current + "/" + segment : segment;
          if (!vault.getAbstractFileByPath(current)) {
            try {
              await vault.createFolder(current);
            } catch (error) {}
          }
        }
      }

      const renameMatch = step.command.match(/^obsidian\s+rename\b.*?\bname=("([^"]*)"|([^\s"]+))/);
      const renameMap = new Map();
      if (renameMatch) {
        const requestedName = renameMatch[2] !== undefined ? renameMatch[2] : renameMatch[3];
        const folderNames = new Map();
        for (const source of lines) {
          const folder = source.includes("/") ? source.substring(0, source.lastIndexOf("/")) : "";
          const sourceName = source.includes("/") ? source.split("/").pop() : source;
          const sourceDotIndex = sourceName.lastIndexOf(".");
          const sourceExt = sourceDotIndex > 0 ? sourceName.substring(sourceDotIndex) : "";
          const requestedDotIndex = requestedName.lastIndexOf(".");
          const baseName =
            requestedDotIndex > 0 ? requestedName.substring(0, requestedDotIndex) : requestedName;
          const ext = requestedDotIndex > 0 ? requestedName.substring(requestedDotIndex) : sourceExt;

          if (!folderNames.has(folder)) {
            const names = new Set();
            vault
              .getFiles()
              .filter((file) => {
                const fileFolder = file.path.includes("/")
                  ? file.path.substring(0, file.path.lastIndexOf("/"))
                  : "";
                return fileFolder === folder;
              })
              .forEach((file) => names.add(file.name));
            folderNames.set(folder, names);
          }

          const names = folderNames.get(folder);
          let candidate = baseName + ext;
          let suffix = 1;
          while (names.has(candidate)) {
            candidate = `${baseName}_${suffix}${ext}`;
            suffix++;
          }
          names.add(candidate);
          renameMap.set(source, candidate);
        }
      }

      const batchResults = [];
      for (const source of lines) {
        let batchCommand = step.command
          .replace(/\{file\}/g, source)
          .replace(/\{上一步结果\}/g, source)
          .replace(/\{prev\}/g, source);

        if (renameMatch && renameMap.has(source)) {
          batchCommand = batchCommand.replace(
            /\bname=("[^"]*"|[^\s"]+)/,
            `name="${renameMap.get(source)}"`,
          );
        }

        if (moveMatch) {
          const moveTarget = moveMatch[2] !== undefined ? moveMatch[2] : moveMatch[3];
          const sourceName = source.includes("/") ? source.split("/").pop() : source;
          const resolvedMoveTarget = moveTarget.replace(/\/$/, "") + "/" + sourceName;
          batchCommand = batchCommand.replace(
            /\bto=("[^"]*"|[^\s"]+)/,
            `to="${resolvedMoveTarget}"`,
          );
        }

        try {
          const output = await this.executeCLI(batchCommand);
          const trimmed = output ? output.trim() : "";
          if (trimmed && /^Error:/i.test(trimmed)) {
            if (/already exists/i.test(trimmed)) {
              batchResults.push(`⏭ ${source}: 已存在，跳过`);
            } else {
              batchResults.push(`❌ ${source}: ${trimmed}`);
              if (!step.continueOnError) {
                new obsidian.Notice(`批量步骤 ${i + 1} 中 "${source}" 失败，序列已停止`);
                break;
              }
            }
          } else {
            batchResults.push("✅ " + source + (trimmed ? ": " + trimmed : ""));
          }
        } catch (error) {
          if (/already exists/i.test(error.message)) {
            batchResults.push(`⏭ ${source}: 已存在，跳过`);
          } else {
            batchResults.push(`❌ ${source}: ${error.message}`);
            if (!step.continueOnError) {
              new obsidian.Notice(`批量步骤 ${i + 1} 中 "${source}" 失败，序列已停止`);
              break;
            }
          }
        }
      }

      prevResult = batchResults.join("\n");
      results.push({
        step: i + 1,
        command: step.command,
        result: prevResult,
        success: !batchResults.some((line) => line.startsWith("❌")),
      });
    } else {
      const isPrevWrite =
        usesPrev && command.match(/^obsidian\s+(daily:append|daily:prepend|append|prepend)\b/);

      if (isPrevWrite) {
        new obsidian.Notice(`步骤 ${i + 1}/${workflow.steps.length}: ${step.label || step.command}`);
        try {
          const writeResult = await _pluginExecPrevWrite.call(this, command, rawPrev);
          prevResult = writeResult;
          results.push({
            step: i + 1,
            command: step.command,
            result: writeResult,
            success: true,
          });
        } catch (error) {
          results.push({
            step: i + 1,
            command: command,
            result: error.message,
            success: false,
          });
          if (!step.continueOnError) {
            new obsidian.Notice(`步骤 ${i + 1} 失败，序列已停止`);
            break;
          }
        }
      } else {
        if (usesPrev) {
          const escapedPrev = rawPrev
            .replace(/\\/g, "\\\\")
            .replace(/"/g, '\\"')
            .replace(/\$/g, "\\$")
            .replace(/`/g, "\\`")
            .replace(/\r\n|\r|\n/g, "\\n");
          const prevPattern = /\{上一步结果\}|\{prev\}/g;
          const parts = command.split('"');
          for (let idx = 0; idx < parts.length; idx++) {
            parts[idx] =
              idx % 2 === 0
                ? parts[idx].replace(prevPattern, `"${escapedPrev}"`)
                : parts[idx].replace(prevPattern, escapedPrev);
          }
          command = parts.join('"');
        }

        new obsidian.Notice(`步骤 ${i + 1}/${workflow.steps.length}: ${step.label || step.command}`);

        if (step.isEval) {
          try {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
            const runner = new AsyncFunction(
              "app",
              "plugin",
              "obsidian",
              "executeCLI",
              "prev",
              command,
            );
            const evalResult = await runner(
              this.app,
              this,
              obsidian,
              (cmd) => this.executeCLI(cmd),
              rawPrev,
            );
            const rendered =
              evalResult == null
                ? "(脚本执行完毕，无返回值)"
                : typeof evalResult === "object"
                  ? JSON.stringify(evalResult, null, 2)
                  : String(evalResult);
            prevResult = rendered;
            results.push({
              step: i + 1,
              command: step.label || step.command,
              result: rendered,
              success: true,
            });
          } catch (error) {
            results.push({
              step: i + 1,
              command: step.label || step.command,
              result: error.message,
              success: false,
            });
            if (!step.continueOnError) {
              new obsidian.Notice(`步骤 ${i + 1} 失败，序列已停止`);
              break;
            }
          }
        } else {
          try {
            const output = await this.executeCLI(command, context);
            prevResult = output;
            results.push({
              step: i + 1,
              command: step.command,
              result: output,
              success: true,
            });
          } catch (error) {
            results.push({
              step: i + 1,
              command: command,
              result: error.message,
              success: false,
            });
            if (!step.continueOnError) {
              new obsidian.Notice(`步骤 ${i + 1} 失败，序列已停止`);
              break;
            }
          }
        }
      }
    }

    if (step.sleep > 0 && i < workflow.steps.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, step.sleep));
    }
  }

  const combined = results
    .map((result) => `[步骤${result.step}] ${result.command}\n${result.result || "(无输出)"}`)
    .join("\n\n");
  const success = !results.some((result) => !result.success);
  return { results, combined, success };
}

async function _pluginExecPrevWrite(cmd, prevResult) {
  const vault = this.app.vault;
  const action = cmd.match(/^obsidian\s+(daily:append|daily:prepend|append|prepend)\b/)[1];
  const isDaily = action.startsWith("daily:");
  const isPrepend = action.endsWith("prepend");

  let content =
    cmd.match(/content="((?:[^"\\]|\\.)*)"/)?.[1] ||
    cmd.match(/content=([^\s]+)/)?.[1] ||
    "";
  content = content
    .replace(/\\"/g, '"')
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\{上一步结果\}|\{prev\}/g, prevResult);

  const writeContent = /\binline\b/.test(cmd) ? content : "\n" + content;

  if (isDaily) {
    const dailyPlugin = this.app.internalPlugins?.getPluginById("daily-notes");
    const moment = window.moment;
    if (!moment) {
      throw new Error("moment.js 不可用");
    }

    const format = dailyPlugin?.instance?.options?.format || "YYYY-MM-DD";
    const folder = dailyPlugin?.instance?.options?.folder || "";
    const dateName = moment().format(format);
    const path = folder ? `${folder}/${dateName}.md` : `${dateName}.md`;

    let file = vault.getAbstractFileByPath(path);
    if (!file) {
      await vault.create(path, "");
      file = vault.getAbstractFileByPath(path);
    }

    const existing = await vault.read(file);
    await vault.modify(file, isPrepend ? writeContent + "\n" + existing : existing + writeContent);
    return "";
  }

  let path =
    cmd.match(/path="((?:[^"\\]|\\.)*)"/)?.[1] ||
    cmd.match(/path=([^\s]+)/)?.[1] ||
    null;

  if (!path) {
    const fileName =
      cmd.match(/file="((?:[^"\\]|\\.)*)"/)?.[1] ||
      cmd.match(/file=([^\s]+)/)?.[1] ||
      null;
    if (fileName) {
      const file = vault
        .getFiles()
        .find((candidate) => candidate.basename === fileName || candidate.name === fileName || candidate.name === fileName + ".md");
      if (!file) {
        throw new Error(`文件 "${fileName}" 未找到`);
      }
      path = file.path;
    } else {
      const activeFile = this.app.workspace.getActiveFile();
      if (!activeFile) {
        throw new Error("没有活跃文件，请指定 file 或 path 参数");
      }
      path = activeFile.path;
    }
  }

  const targetFile = vault.getAbstractFileByPath(path);
  if (!targetFile) {
    throw new Error(`文件 "${path}" 未找到`);
  }

  const existing = await vault.read(targetFile);
  await vault.modify(targetFile, isPrepend ? writeContent + "\n" + existing : existing + writeContent);
  return "";
}

module.exports = { runWorkflow, _pluginExecPrevWrite };
