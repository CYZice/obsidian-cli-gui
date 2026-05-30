const { compareVersions } = require("./version");
const { generateSecureHash, generateSimpleHash } = require("./hash");
const { getNewNoteFolderPath, getUniqueUntitledPath } = require("./path");

module.exports = {
  compareVersions,
  generateSecureHash,
  generateSimpleHash,
  getNewNoteFolderPath,
  getUniqueUntitledPath,
};