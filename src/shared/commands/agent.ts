// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const agentCommands: CLICommandDefinition[] = [
  {
    "id": "agent",
    "category": "agent",
    "name": "Agent",
    "desc": "调用 FlowText Agent 执行智能任务（需安装 FlowText 插件）",
    "isVirtual": false,
    "params": [
      {
        "name": "content",
        "label": "任务描述",
        "type": "textarea",
        "required": false,
        "placeholder": "描述需要 Agent 执行的任务..."
      },
      {
        "name": "path",
        "label": "目标文件",
        "type": "text",
        "required": true,
        "placeholder": "文件路径"
      }
    ]
  }
];
