/**
 * 获取新建笔记的文件夹路径
 * @param {object} ctx - { vault, workspace }
 * @returns {string}
 */
function getNewNoteFolderPath(ctx) {
  let vault = ctx?.vault;
  if (vault) {
    var getConfig = (key) => {
      try {
        if (typeof vault.getConfig === "function") return vault.getConfig(key);
      } catch (e) {}
      try {
        return vault.config?.[key];
      } catch (e) {}
    };
    var newFileLocation = getConfig("newFileLocation");
    var newFileFolderPath = String(getConfig("newFileFolderPath") || "").trim();
    if (newFileLocation === "folder" && newFileFolderPath) {
      return newFileFolderPath.replace(/\/+$/g, "");
    }
    if (newFileLocation === "current") {
      var activeFile = ctx.workspace?.getActiveFile?.();
      if (activeFile?.path) {
        var lastSlash = activeFile.path.lastIndexOf("/");
        return lastSlash === -1 ? "" : activeFile.path.slice(0, lastSlash);
      }
    }
  }
  return "";
}

/**
 * 生成唯一的未命名文件路径
 * @param {object} vault - Obsidian vault
 * @param {string} folder - 文件夹路径
 * @returns {string}
 */
function getUniqueUntitledPath(vault, folder) {
  var folderPath = (folder || "").replace(/\/+$/g, "");
  var makePath = (name) => (folderPath ? folderPath + "/" + name : name);
  var path = makePath("未命名.md");
  if (!vault?.getAbstractFileByPath(path)) return path;
  var num = 1;
  for (;;) {
    var tryPath = makePath(`未命名_${num}.md`);
    if (!vault.getAbstractFileByPath(tryPath)) return tryPath;
    num++;
  }
}

module.exports = { getNewNoteFolderPath, getUniqueUntitledPath };