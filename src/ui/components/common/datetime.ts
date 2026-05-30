import type { WorkflowSchedule } from "../../../types";

export function formatTime(date: Date | number): string {
  const value = new Date(date);
  const pad = (input: number) => String(input).padStart(2, "0");
  return `${value.getMonth() + 1}/${value.getDate()} ${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function formatScheduleDesc(schedule?: WorkflowSchedule | null): string {
  if (!schedule) {
    return "";
  }
  if (schedule.type === "daily") {
    return `每天 ${schedule.time || "08:00"}`;
  }
  if (schedule.type === "weekly") {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return `每周${days[schedule.weekday ?? 1]} ${schedule.time || "08:00"}`;
  }
  if (schedule.type === "interval") {
    return `每隔 ${schedule.intervalMin || 60} 分钟`;
  }
  return "";
}
