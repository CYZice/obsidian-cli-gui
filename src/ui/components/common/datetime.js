/**
 * 格式化时间为 MM/DD HH:mm
 * @param {Date|number} date
 * @returns {string}
 */
function formatTime(date) {
  var d = new Date(date);
  var pad = (n) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:` + pad(d.getMinutes());
}

/**
 * 格式化调度描述
 * @param {object} schedule
 * @returns {string}
 */
function formatScheduleDesc(schedule) {
  if (!schedule) return "";
  if (schedule.type === "daily") {
    return "每天 " + (schedule.time || "08:00");
  }
  if (schedule.type === "weekly") {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `每周${days[schedule.weekday ?? 1]} ` + (schedule.time || "08:00");
  }
  if (schedule.type === "interval") {
    return `每隔 ${schedule.intervalMin || 60} 分钟`;
  }
  return "";
}

module.exports = { formatTime, formatScheduleDesc };