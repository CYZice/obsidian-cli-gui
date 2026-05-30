let crypto = null;
try {
  crypto = require("crypto");
} catch (e) {
  crypto = null;
}

/**
 * 生成64位简单哈希（备用方案）
 * @param {string} str
 * @returns {string}
 */
function generateSimpleHash(str) {
  let hash = 0;
  if (str.length === 0) return hash.toString(16);
  for (let i = 0; i < str.length; i++) {
    var charCode = str.charCodeAt(i);
    hash = (hash << 5) - hash + charCode;
    hash &= hash;
  }
  return (
    Math.abs(hash).toString(16) +
    str.length.toString(16) +
    Date.now().toString(16).slice(-8)
  )
    .padStart(64, "0")
    .slice(0, 64);
}

/**
 * 生成安全哈希（SHA-256）
 * @param {string} str
 * @param {string|null} salt
 * @returns {string|Promise<string>}
 */
function generateSecureHash(str, salt = null) {
  str = (salt = salt || `cli_salt_${Math.floor(Date.now() / 864e5)}_security`) + str + salt;
  if (crypto && crypto.createHash) {
    try {
      var hash = crypto.createHash("sha256");
      return hash.update(str).digest("hex");
    } catch (e) {}
  }
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      return window.crypto.subtle
        .digest("SHA-256", new TextEncoder().encode(str))
        .then((buf) =>
          Array.from(new Uint8Array(buf))
            .map((e) => e.toString(16).padStart(2, "0"))
            .join(""),
        )
        .catch(() => null);
    } catch (e) {}
  }
  return generateSimpleHash(str);
}

module.exports = { generateSecureHash, generateSimpleHash };