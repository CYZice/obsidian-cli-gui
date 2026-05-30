import type { WorkflowSchedule } from "../../../types";

export function formatTime(date: Date | number): string;
export function formatScheduleDesc(schedule?: WorkflowSchedule | null): string;
