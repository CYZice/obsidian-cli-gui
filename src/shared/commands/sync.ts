// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const syncCommands: CLICommandDefinition[] = [
  {
    "id": "sync",
    "category": "sync",
    "name": "同步开关",
    "desc": "暂停/恢复同步",
    "params": [
      {
        "name": "on",
        "label": "恢复",
        "type": "flag",
        "required": false
      },
      {
        "name": "off",
        "label": "暂停",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "sync:status",
    "category": "sync",
    "name": "同步状态",
    "desc": "同步状态和用量",
    "params": []
  },
  {
    "id": "sync:history",
    "category": "sync",
    "name": "同步历史",
    "desc": "同步版本历史",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": false
      },
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "sync:read",
    "category": "sync",
    "name": "读取同步版本",
    "desc": "读取同步版本",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": false
      },
      {
        "name": "version",
        "label": "版本号",
        "type": "number",
        "required": false
      }
    ]
  },
  {
    "id": "sync:restore",
    "category": "sync",
    "name": "恢复同步版本",
    "desc": "恢复同步版本",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": false
      },
      {
        "name": "version",
        "label": "版本号",
        "type": "number",
        "required": false
      }
    ],
    "dangerous": false
  },
  {
    "id": "sync:open",
    "category": "sync",
    "name": "打开同步历史",
    "desc": "打开同步历史",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "sync:deleted",
    "category": "sync",
    "name": "已删除文件",
    "desc": "同步中已删除文件",
    "params": [
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      }
    ]
  }
];