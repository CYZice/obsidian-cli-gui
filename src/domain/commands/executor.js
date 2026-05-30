/**
 * CLI 命令执行器
 */
const obsidian = require("obsidian");
const { resolveTemplateVars } = require("./builder");
const path = require("path");
const fs = require("fs");
const { exec, execSync } = require("child_process");

/**
 * 获取 Obsidian 可执行文件路径
 * @returns {string}
 */
function getObsidianBin() {
  if (this._obsidianBin) return this._obsidianBin;

  const isWin = navigator.platform.indexOf("Win") !== -1;

  if (isWin) {
    const dirs = [
      path.join(process.env.LOCALAPPDATA || "", "Programs", "Obsidian", "Obsidian.com"),
      path.join(process.env.LOCALAPPDATA || "", "Obsidian", "Obsidian.com"),
      path.join(process.env.PROGRAMFILES || "", "Obsidian", "Obsidian.com"),
    ];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        this._obsidianBin = dir;
        return this._obsidianBin;
      }
    }
  } else {
    const dirs = [
      "/Applications/Obsidian.app/Contents/MacOS/obsidian",
      "/usr/local/bin/obsidian",
      "/opt/homebrew/bin/obsidian",
      process.env.HOME + "/bin/obsidian",
    ];
    for (const dir of dirs) {
      if (fs.existsSync(dir)) {
        this._obsidianBin = dir;
        return this._obsidianBin;
      }
    }
    try {
      const result = execSync("which obsidian 2>/dev/null", { timeout: 3000 }).toString().trim();
      if (result) {
        this._obsidianBin = result;
        return this._obsidianBin;
      }
    } catch (e) {}
  }

  this._obsidianBin = "obsidian";
  return this._obsidianBin;
}

/**
 * 解决文件路径冲突
 * @param {string} targetPath
 * @returns {string}
 */
function resolveConflictPath(targetPath) {
  var vault = this.app.vault;
  if (!vault.getAbstractFileByPath(targetPath)) return targetPath;

  var dotIndex = targetPath.lastIndexOf(".");
  var slashIndex = targetPath.lastIndexOf("/") + 1;
  var hasExt = slashIndex < dotIndex;
  var base = hasExt ? targetPath.slice(0, dotIndex) : targetPath;
  var ext = hasExt ? targetPath.slice(dotIndex) : "";

  if (this.settings.moveConflictSuffix === "timestamp") {
    return (
      base +
      "_" +
      new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .replace("T", "_")
        .slice(0, 19) +
      ext
    );
  }

  let num = 1;
  let newPath;
  do {
    newPath = base + "_" + num + ext;
    num++;
  } while (vault.getAbstractFileByPath(newPath));
  return newPath;
}

/**
 * 获取 FlowText 插件
 * @returns {object|null}
 */
function getFlowTextPlugin() {
  return this.app.plugins?.plugins?.flowtext || null;
}

/**
 * 执行 Agent 命令
 * @param {string} cmd
 * @param {object} context
 * @returns {Promise<string>}
 */
async function executeAgent(cmd, context) {
  var plugin = getFlowTextPlugin.call(this);
  if (!plugin) throw new Error("FlowText 插件未安装或未启用，无法使用 Agent 功能");
  if (typeof plugin.runAgentTask !== "function")
    throw new Error("FlowText 插件版本过低，请更新以支持 Agent API");

  var contentMatch = cmd.match(/content="((?:[^"\\]|\\.)*)"/);
  var contentSimple = !contentMatch && cmd.match(/content=(\S+)/);
  var content = contentMatch
    ? contentMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\")
    : contentSimple
      ? contentSimple[1]
      : "";

  if (!content) throw new Error("agent 命令缺少 content 参数，请指定任务描述");

  var pathMatch = cmd.match(/\bpath="((?:[^"\\]|\\.)*)"/);
  var pathSimple = !pathMatch && cmd.match(/\bpath=(\S+)/);
  var filePath = pathMatch
    ? pathMatch[1].replace(/\\"/g, '"')
    : pathSimple
      ? pathSimple[1]
      : "";

  var workflowContext = (context && context.__workflowContext) || "";

  let targetFile = null;
  if (filePath) {
    var file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof obsidian.TFile)) throw new Error(`文件 "${filePath}" 未找到`);
    targetFile = file;
  }

  new obsidian.Notice("🤖 Agent 处理: " + (filePath || content.slice(0, 30)));

  while (this._agentRunning) {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  this._agentRunning = true;

  var options = {
    showPanel: !!!this.app.workspace.getLeavesOfType("flowtext-agent-view")[0],
  };
  if (workflowContext) options.context = workflowContext;
  if (filePath) options.filePath = filePath;

  var workspace = this.app.workspace;
  var originalGetActiveFile = workspace.getActiveFile ? workspace.getActiveFile.bind(workspace) : null;
  var result;

  try {
    if (targetFile && originalGetActiveFile) {
      workspace.getActiveFile = () => targetFile;
    }
    result = await plugin.runAgentTask(content, options);
  } finally {
    if (originalGetActiveFile) workspace.getActiveFile = originalGetActiveFile;
    this._agentRunning = false;
  }

  if (result && result.success) return result.answer || "(Agent 任务完成)";
  throw new Error(result?.answer || "Agent 任务执行失败");
}

/**
 * 执行 CLI 命令
 * @param {string} cmd
 * @param {object} options
 * @returns {Promise<string>}
 */
async function executeCLI(cmd, options) {
  cmd = resolveTemplateVars(cmd, this.app);

  // 处理 agent 命令
  if (/^obsidian\s+agent\b/.test(cmd)) {
    return executeAgent.call(this, cmd, options);
  }

  // 处理 orphans:folder 虚拟命令
  if (/^obsidian\s+orphans:folder\b/.test(cmd)) {
    return executeOrphansFolder.call(this, cmd);
  }

  // 处理文件移动冲突
  if (this.settings.moveConflictRename) {
    var moveMatch = cmd.match(/^obsidian\s+move\b(.*?)\bto=("([^"]*)"|([^\s"]+))(.*)/);
    if (moveMatch) {
      var targetPath = moveMatch[3] !== undefined ? moveMatch[3] : moveMatch[4];
      var resolvedPath = resolveConflictPath.call(this, targetPath);
      if (resolvedPath !== targetPath) {
        cmd = cmd.replace(/\bto=("[^"]*"|[^\s"]+)/, `to="${resolvedPath}"`);
      }
    }
  }

  var isWin = navigator.platform.indexOf("Win") !== -1;
  var obsidianPath = getObsidianBin.call(this);
  var binArg = obsidianPath !== "obsidian" && (obsidianPath.includes(" ") || obsidianPath.includes("\\"))
    ? `"${obsidianPath}"`
    : obsidianPath;

  var fullCmd = cmd.replace(/^obsidian\b/, binArg);
  var execOptions = {
    timeout: 30000,
    maxBuffer: 1048576,
    encoding: "utf8",
    env: Object.assign({}, process.env, options || {}),
  };

  var vaultPath = this.app.vault.adapter.basePath;
  if (vaultPath) execOptions.cwd = vaultPath;
  if (!isWin) execOptions.shell = "/bin/bash";

  return new Promise((resolve, reject) => {
    exec(fullCmd, execOptions, (error, stdout, stderr) => {
      if (error) {
        var errMsg = stderr && stderr.trim() ? stderr.trim() : error.message;
        console.error("[CLI Commander] 命令执行失败:", {
          原始命令: cmd,
          实际命令: fullCmd,
          可执行文件: obsidianPath,
          错误信息: errMsg,
          stderr: stderr,
          error: error,
        });
        reject(new Error(errMsg.replace(/\s+/g, " ")));
      } else {
        var stderrTrim = stderr && stderr.trim();
        if (!stdout && stderrTrim && /^Error:/i.test(stderrTrim)) {
          console.error("[CLI Commander] 命令返回错误:", {
            原始命令: cmd,
            实际命令: fullCmd,
            stderr: stderrTrim,
          });
          reject(new Error(stderrTrim.replace(/\s+/g, " ")));
        } else {
          resolve(stdout || stderr || "");
        }
      }
    });
  });
}

/**
 * 执行 orphans:folder 虚拟命令
 * @param {string} cmd
 * @returns {Promise<string>}
 */
async function executeOrphansFolder(cmd) {
  var folderMatch = cmd.match(/\bfolder=("([^"]*)"|([^\s"]+))/);
  var extMatch = cmd.match(/\bext=("([^"]*)"|([^\s"]+))/);
  var totalOnly = /\btotal\b/.test(cmd);
  var folder = folderMatch ? (folderMatch[2] !== undefined ? folderMatch[2] : folderMatch[3]) : "";
  var extFilter = extMatch ? (extMatch[2] !== undefined ? extMatch[2] : extMatch[3]) : "";

  var vault = this.app.vault;
  var metadataCache = this.app.metadataCache;
  var linkedFiles = new Set();
  var filesWithLinks = new Set();

  for (var resolved of Object.values(metadataCache.resolvedLinks)) {
    for (var target of Object.keys(resolved)) {
      linkedFiles.add(target);
    }
  }

  for (var [source, targets] of Object.entries(metadataCache.resolvedLinks)) {
    if (Object.keys(targets).length > 0) {
      filesWithLinks.add(source);
    }
  }

  var mdFiles = [];
  for (var file of vault.getMarkdownFiles()) {
    var cache = metadataCache.getFileCache(file);
    if (cache) {
      if (cache.frontmatter) {
        for (var [key, value] of Object.entries(cache.frontmatter)) {
          if (
            key !== "position" &&
            key !== "tags" &&
            typeof value === "string" &&
            value.trim()
          ) {
            var dest = metadataCache.getFirstLinkpathDest(value, file.path);
            if (dest) {
              linkedFiles.add(dest.path);
              filesWithLinks.add(file.path);
            }
          }
        }
      }
      if (cache.sections) mdFiles.push(file);
    }
  }

  var fileReads = mdFiles.map((file) =>
    vault
      .cachedRead(file)
      .then((content) => ({ file, content }))
      .catch(() => null),
  );

  for (var item of await Promise.all(fileReads)) {
    if (item) {
      var { file, content } = item;
      for (var match of content.matchAll(/src=["']([^"']+)["']/g)) {
        var src = decodeURIComponent(match[1]);
        var dest = metadataCache.getFirstLinkpathDest(src, file.path);
        if (dest) {
          linkedFiles.add(dest.path);
          filesWithLinks.add(file.path);
        }
      }
    }
  }

  var allFiles;
  if (extFilter === "all") {
    allFiles = vault.getFiles();
  } else if (extFilter && extFilter !== "") {
    var exts = extFilter.split(",").map((e) => e.trim().toLowerCase().replace(/^\./, ""));
    allFiles = vault.getFiles().filter((file) => {
      return exts.includes(file.extension.toLowerCase());
    });
  } else {
    allFiles = vault.getMarkdownFiles();
  }

  var folderPath = folder.replace(/\/$/, "") + "/";
  var orphans = (folder ? allFiles.filter((f) => f.path.startsWith(folderPath)) : allFiles).filter(
    (f) => !linkedFiles.has(f.path) && !filesWithLinks.has(f.path),
  );

  if (totalOnly) {
    return String(orphans.length);
  }
  return orphans.length
    ? orphans.map((f) => f.path).join("\n")
    : `「${folder || "整库"}」中没有孤立笔记`;
}

module.exports = { executeCLI };
