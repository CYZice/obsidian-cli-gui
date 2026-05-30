// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const historyCommands: CLICommandDefinition[] = [
  {
    "id": "diff",
    "category": "history",
    "name": "版本对比",
    "desc": "对比历史版本",
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
        "name": "from",
        "label": "起始版本",
        "type": "number",
        "required": true
      },
      {
        "name": "to",
        "label": "目标版本",
        "type": "number",
        "required": true
      },
      {
        "name": "filter",
        "label": "来源",
        "type": "select",
        "options": [
          "local",
          "sync"
        ],
        "required": true
      }
    ]
  },
  {
    "id": "history",
    "category": "history",
    "name": "文件历史",
    "desc": "历史版本列表",
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
      }
    ]
  },
  {
    "id": "history:list",
    "category": "history",
    "name": "有历史的文件",
    "desc": "有本地历史的文件",
    "params": []
  },
  {
    "id": "history:read",
    "category": "history",
    "name": "读取历史",
    "desc": "读取历史版本",
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
        "name": "version",
        "label": "版本号",
        "type": "number",
        "required": true
      }
    ]
  },
  {
    "id": "history:restore",
    "category": "history",
    "name": "恢复历史",
    "desc": "恢复历史版本",
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
        "name": "version",
        "label": "版本号",
        "type": "number",
        "required": false
      }
    ],
    "dangerous": false
  },
  {
    "id": "history:open",
    "category": "history",
    "name": "文件恢复",
    "desc": "打开文件恢复",
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
      }
    ]
  }
];
