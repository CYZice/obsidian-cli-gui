/**
 * 插件完整性验证（已简化，移除内容保护）
 */

/**
 * 验证插件完整性（开源版本不需要验证）
 * @param {object} manifest - 插件 manifest
 * @param {string} pluginPath - 插件路径
 * @returns {Promise<boolean>}
 */
async function validatePluginIntegrity(manifest, pluginPath) {
  // 开源版本不需要验证
  return true;
}

/**
 * 生成插件指纹（开源版本不需要）
 */
async function generatePluginFingerprint(manifest, pluginPath) {
  return null;
}

module.exports = { validatePluginIntegrity, generatePluginFingerprint };