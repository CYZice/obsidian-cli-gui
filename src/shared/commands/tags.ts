// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const tagsCommands: CLICommandDefinition[] = [
  {
    "id": "tags",
    "category": "tags",
    "name": "列出标签",
    "desc": "列出仓库标签",
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
        "name": "sort",
        "label": "排序",
        "type": "select",
        "options": [
          "name",
          "count"
        ],
        "required": true
      },
      {
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "tsv",
          "json",
          "csv"
        ],
        "required": true
      },
      {
        "name": "total",
        "label": "仅总数",
        "type": "flag",
        "required": true
      },
      {
        "name": "counts",
        "label": "数量",
        "type": "flag",
        "required": true
      },
      {
        "name": "active",
        "label": "当前文件",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "tag",
    "category": "tags",
    "name": "标签信息",
    "desc": "查看标签详情",
    "params": [
      {
        "name": "name",
        "label": "标签名",
        "type": "text",
        "required": false
      },
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": true
      },
      {
        "name": "verbose",
        "label": "文件列表",
        "type": "flag",
        "required": true
      }
    ]
  }
];
