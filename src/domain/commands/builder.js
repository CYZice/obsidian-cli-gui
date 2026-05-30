/**
 * 解析模板变量
 * @param {string} str - 包含 {{var}} 的字符串
 * @param {object} ctx - { workspace }
 * @returns {string}
 */
function resolveTemplateVars(str, ctx) {
  var now = new Date();
  var pad = (n) => String(n).padStart(2, "0");
  var year = now.getFullYear();
  var month = pad(now.getMonth() + 1);
  var day = pad(now.getDate());
  var hour = pad(now.getHours());
  var minute = pad(now.getMinutes());
  var utcDate = new Date(Date.UTC(year, now.getMonth(), now.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  var weekYear = utcDate.getUTCFullYear();
  var weekNum = pad(Math.ceil(((utcDate - new Date(Date.UTC(weekYear, 0, 1))) / 864e5 + 1) / 7));
  var activeFile = ctx && ctx.workspace ? ctx.workspace.getActiveFile() : null;

  let vars = {
    date: year + `-${month}-` + day,
    time: hour + ":" + minute,
    datetime: year + `-${month}-${day} ${hour}:` + minute,
    week: year + "-W" + weekNum,
    month: year + "-" + month,
    year: String(year),
    title: activeFile ? activeFile.basename : "",
    file: activeFile ? activeFile.path : "",
    folder: activeFile && activeFile.parent ? activeFile.parent.path : "",
  };

  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => (key in vars ? vars[key] : `{{${key}}}`));
}

/**
 * 格式化调度描述
 * @param {object} schedule - 调度配置
 * @returns {string}
 */
function formatScheduleDesc(schedule) {
  return schedule
    ? schedule.type === "daily"
      ? "每天 " + (schedule.time || "08:00")
      : schedule.type === "weekly"
        ? `每周${["日", "一", "二", "三", "四", "五", "六"][schedule.weekday ?? 1]} ` + (schedule.time || "08:00")
        : schedule.type === "interval"
          ? `每隔 ${schedule.intervalMin || 60} 分钟`
          : ""
    : "";
}

/**
 * 将命令对象构建为 CLI 字符串
 * @param {object} cmd - 命令定义
 * @param {object} paramValues - 参数值
 * @returns {string}
 */
function buildCommandString(cmd, paramValues) {
  let parts = ["obsidian", cmd.id];
  cmd.params.forEach((param) => {
    var val = paramValues[param.name];
    if (val === undefined || val === "" || val === false || val === null) return;
    if (param.type === "flag") {
      val && parts.push(param.name);
    } else {
      val = String(val)
        .replace(/\\/g, "\\\\")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "")
        .replace(/\t/g, "\\t");
      parts.push(
        val.includes(" ") || val.includes('"') || val.includes("\\n") || val.includes("\\t")
          ? `${param.name}="${val.replace(/"/g, '\\"')}"`
          : param.name + "=" + val,
      );
    }
  });
  return parts.join(" ");
}

module.exports = { resolveTemplateVars, formatScheduleDesc, buildCommandString };