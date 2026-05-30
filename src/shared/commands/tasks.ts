// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const tasksCommands: CLICommandDefinition[] = [
  {
    "id": "tasks",
    "category": "tasks",
    "name": "列出任务",
    "desc": "列出仓库中的任务",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": true
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": true
      },
      {
        "name": "status",
        "label": "状态字符",
        "type": "text",
        "required": true
      },
      {
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "text",
          "json",
          "tsv",
          "csv"
        ],
        "required": true
      },
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": true
      },
      {
        "name": "done",
        "label": "已完成",
        "type": "flag",
        "required": true
      },
      {
        "name": "todo",
        "label": "未完成",
        "type": "flag",
        "required": true
      },
      {
        "name": "verbose",
        "label": "详细",
        "type": "flag",
        "required": true
      },
      {
        "name": "active",
        "label": "当前文件",
        "type": "flag",
        "required": true
      },
      {
        "name": "daily",
        "label": "今日日记",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "task",
    "category": "tasks",
    "name": "操作任务",
    "desc": "查看或更新任务",
    "params": [
      {
        "name": "ref",
        "label": "引用",
        "type": "text",
        "required": true,
        "placeholder": "path:line"
      },
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": true
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": true
      },
      {
        "name": "line",
        "label": "行号",
        "type": "number",
        "required": true
      },
      {
        "name": "status",
        "label": "状态",
        "type": "text",
        "required": true
      },
      {
        "name": "toggle",
        "label": "切换",
        "type": "flag",
        "required": true
      },
      {
        "name": "done",
        "label": "完成",
        "type": "flag",
        "required": true
      },
      {
        "name": "todo",
        "label": "待办",
        "type": "flag",
        "required": true
      },
      {
        "name": "daily",
        "label": "日记",
        "type": "flag",
        "required": true
      }
    ]
  }
];
