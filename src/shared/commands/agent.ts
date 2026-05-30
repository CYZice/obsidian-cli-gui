// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const agentCommands: CLICommandDefinition[] = [
  {
    "id": "agent",
    "category": "agent",
    "name": "Agent",
    "desc": "调用 Yolo Agent 执行智能任务（需安装 Yolo 插件）",
    "isVirtual": false,
    "params": [
      {
        "name": "content",
        "label": "任务描述",
        "type": "textarea",
        "required": true,
        "placeholder": "描述需要 Agent 执行的任务..."
      },
      {
        "name": "filePath",
        "label": "目标文件",
        "type": "text",
        "required": false,
        "placeholder": "文件路径"
      },
      {
        "name": "folderPath",
        "label": "目标文件夹",
        "type": "text",
        "required": false,
        "placeholder": "文件夹路径"
      },
      {
        "name": "assistantId",
        "label": "Assistant ID",
        "type": "text",
        "required": false,
        "placeholder": "可选的 assistantId"
      }
    ]
  }
];
