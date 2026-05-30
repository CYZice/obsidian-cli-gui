const { generateSecureHash, generateSimpleHash } = require("../../shared/utils/hash");
const { compareVersions } = require("../../shared/utils/version");

/**
 * 生成插件指纹
 * @param {object} manifest - 插件 manifest
 * @param {string} pluginPath - 插件路径
 * @returns {string|Promise<string>|null}
 */
async function generatePluginFingerprint(manifest, pluginPath) {
  try {
    var info = {
      id: manifest.id || "obsidian-cli-gui",
      version: manifest.version,
      author: manifest.author,
      name: manifest.name,
      path: pluginPath.replace(/\\/g, "/"),
      minAppVersion: manifest.minAppVersion,
    };
    var hash = generateSecureHash(JSON.stringify(info, Object.keys(info).sort()));
    return hash && typeof hash.then === "function" ? await hash : hash;
  } catch (e) {
    return null;
  }
}

/**
 * 验证插件完整性
 * @param {object} manifest - 插件 manifest
 * @param {string} pluginPath - 插件路径
 * @returns {Promise<boolean>}
 */
async function validatePluginIntegrity(manifest, pluginPath) {
  try {
    var validHash, currentHash, valid, current;
    return await generatePluginFingerprint(manifest, pluginPath)
      ? ((validHash = "obsidian-cli-gui"),
        (currentHash = "CYZice"),
        manifest.id === validHash &&
          manifest.author === currentHash &&
          compareVersions(manifest.version, "1.3.0") >= 0 &&
          ((valid = generateSecureHash(JSON.stringify({ id: validHash, author: currentHash }))),
          (current = generateSecureHash(JSON.stringify({ id: manifest.id, author: manifest.author }))),
          (valid = valid && typeof valid.then === "function" ? await valid : valid),
          (current = current && typeof current.then === "function" ? await current : current) === valid))
      : false;
  } catch (e) {
    return false;
  }
}

module.exports = { generatePluginFingerprint, validatePluginIntegrity };