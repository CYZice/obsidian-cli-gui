// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const bookmarksCommands: CLICommandDefinition[] = [
  {
    "id": "bookmarks",
    "category": "bookmarks",
    "name": "列出书签",
    "desc": "列出所有书签",
    "params": [
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
        "label": "仅数量",
        "type": "flag",
        "required": true
      },
      {
        "name": "verbose",
        "label": "类型",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "bookmark",
    "category": "bookmarks",
    "name": "添加书签",
    "desc": "添加新书签",
    "params": [
      {
        "name": "file",
        "label": "文件",
        "type": "text",
        "required": true
      },
      {
        "name": "subpath",
        "label": "子路径",
        "type": "text",
        "required": true
      },
      {
        "name": "folder",
        "label": "文件夹",
        "type": "text",
        "required": true
      },
      {
        "name": "search",
        "label": "搜索",
        "type": "text",
        "required": true
      },
      {
        "name": "url",
        "label": "URL",
        "type": "text",
        "required": true
      },
      {
        "name": "title",
        "label": "标题",
        "type": "text",
        "required": true
      }
    ]
  }
];
