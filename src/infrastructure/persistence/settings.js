const { DEFAULT_SETTINGS } = require("../../shared/constants/defaults");

/**
 * 加载设置
 * @param {object} plugin - 插件实例
 * @returns {Promise<object>}
 */
async function loadSettings(plugin) {
  try {
    var data = await plugin.loadData();
    return { ...DEFAULT_SETTINGS, ...data };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * 保存设置
 * @param {object} plugin - 插件实例
 * @param {object} settings - 设置对象
 * @returns {Promise<void>}
 */
async function saveSettings(plugin, settings) {
  await plugin.saveData(settings);
}

module.exports = { loadSettings, saveSettings };