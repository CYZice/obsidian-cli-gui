/**
 * 获取分类图标
 * @param {string} categoryId
 * @returns {string}
 */
function getCategoryIcon(categoryId) {
  const { CLI_CATEGORIES } = require("../../shared/constants/categories");
  return CLI_CATEGORIES.find((c) => c.id === categoryId)?.icon || "settings";
}

/**
 * 设置 Lucide 图标
 * @param {HTMLElement} el
 * @param {string} iconName
 */
function setIcon(el, iconName) {
  const obsidian = require("obsidian");
  obsidian.setIcon(el, iconName);
}

module.exports = { getCategoryIcon, setIcon };