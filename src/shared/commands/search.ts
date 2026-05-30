// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const searchCommands: CLICommandDefinition[] = [
  {
    "id": "search",
    "category": "search",
    "name": "搜索",
    "desc": "全库文本搜索",
    "params": [
      {
        "name": "query",
        "label": "关键词",
        "type": "text",
        "required": true,
        "placeholder": "搜索关键词"
      },
      {
        "name": "path",
        "label": "限定文件夹",
        "type": "text",
        "required": false
      },
      {
        "name": "limit",
        "label": "最大数",
        "type": "number",
        "required": false
      },
      {
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "text",
          "json"
        ],
        "required": false
      },
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      },
      {
        "name": "case",
        "label": "区分大小写",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "search:context",
    "category": "search",
    "name": "搜索（含上下文）",
    "desc": "搜索并显示匹配行",
    "params": [
      {
        "name": "query",
        "label": "关键词",
        "type": "text",
        "required": true
      },
      {
        "name": "path",
        "label": "限定文件夹",
        "type": "text",
        "required": false
      },
      {
        "name": "limit",
        "label": "最大数",
        "type": "number",
        "required": false
      },
      {
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "text",
          "json"
        ],
        "required": false
      },
      {
        "name": "case",
        "label": "区分大小写",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "search:open",
    "category": "search",
    "name": "打开搜索面板",
    "desc": "打开搜索视图",
    "params": [
      {
        "name": "query",
        "label": "关键词",
        "type": "text",
        "required": false
      }
    ]
  }
];