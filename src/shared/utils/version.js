/**
 * 版本比较
 * @param {string} v1
 * @param {string} v2
 * @returns {number} -1 if v1 < v2, 1 if v1 > v2, 0 if equal
 */
function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  try {
    var a = v1.split(".").map((e) => parseInt(e, 10) || 0);
    var b = v2.split(".").map((e) => parseInt(e, 10) || 0);
    while (a.length < 3) a.push(0);
    while (b.length < 3) b.push(0);
    for (let i = 0; i < 3; i++) {
      if (a[i] < b[i]) return -1;
      if (a[i] > b[i]) return 1;
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

module.exports = { compareVersions };