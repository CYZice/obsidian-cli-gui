import type {
  CLICommandDefinition,
  TemplateContext,
  WorkflowSchedule,
} from "../../types";

export function resolveTemplateVars(input: string, ctx: TemplateContext): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());

  const utcDate = new Date(Date.UTC(year, now.getMonth(), now.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  const weekYear = utcDate.getUTCFullYear();
  const weekNum = pad(
    Math.ceil(((utcDate.getTime() - new Date(Date.UTC(weekYear, 0, 1)).getTime()) / 864e5 + 1) / 7),
  );
  const activeFile = ctx?.workspace?.getActiveFile?.() || null;

  const vars: Record<string, string> = {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
    datetime: `${year}-${month}-${day} ${hour}:${minute}`,
    week: `${year}-W${weekNum}`,
    month: `${year}-${month}`,
    year: String(year),
    title: activeFile ? activeFile.basename : "",
    file: activeFile ? activeFile.path : "",
    folder: activeFile?.parent ? activeFile.parent.path : "",
  };

  return input.replace(/\{\{(\w+)\}\}/g, (_match, key: string) =>
    key in vars ? vars[key] : `{{${key}}}`,
  );
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

export function buildCommandString(
  command: CLICommandDefinition,
  paramValues: Record<string, unknown>,
): string {
  const parts = ["obsidian", command.id];

  command.params.forEach((param) => {
    const rawValue = paramValues[param.name];
    let value = rawValue;
    if (value === undefined || value === "" || value === false || value === null) {
      return;
    }

    if (param.type === "flag") {
      if (value) {
        parts.push(param.name);
      }
      return;
    }

    const serialized = String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "")
      .replace(/\t/g, "\\t");

    parts.push(
      serialized.includes(" ") ||
        serialized.includes('"') ||
        serialized.includes("\\n") ||
        serialized.includes("\\t")
        ? `${param.name}="${serialized.replace(/"/g, '\\"')}"`
        : `${param.name}=${serialized}`,
    );
  });

  return parts.join(" ");
}
