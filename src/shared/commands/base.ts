// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const baseCommands: CLICommandDefinition[] = [
  {
    "id": "bases",
    "category": "base",
    "name": "Bases",
    "desc": "列出.base文件",
    "params": []
  },
  {
    "id": "base:views",
    "category": "base",
    "name": "Base视图",
    "desc": "Base的视图",
    "params": []
  },
  {
    "id": "base:create",
    "category": "base",
    "name": "创建Base条目",
    "desc": "在base数据库某个视图中创建新条目文档（注意不是创建base文档）。如果未指定文件，则默认使用当前活动数据库视图。",
    "params": [
      {
        "name": "file",
        "label": "base文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "path",
        "label": "路径",
        "type": "text",
        "required": false
      },
      {
        "name": "view",
        "label": "视图名",
        "type": "text",
        "required": true
      },
      {
        "name": "name",
        "label": "新条目文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "content",
        "label": "条目文档内容",
        "type": "textarea",
        "required": false
      },
      {
        "name": "open",
        "label": "打开",
        "type": "flag",
        "required": false
      },
      {
        "name": "newtab",
        "label": "新标签页",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "base:query",
    "category": "base",
    "name": "查询Base",
    "desc": "查询Base",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": false
      },
      {
        "name": "path",
        "label": "路径",
        "type": "text",
        "required": false
      },
      {
        "name": "view",
        "label": "视图",
        "type": "text",
        "required": true
      },
      {
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "json",
          "csv",
          "tsv",
          "md",
          "paths"
        ],
        "required": false
      }
    ]
  }
];