// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const linksCommands: CLICommandDefinition[] = [
  {
    "id": "backlinks",
    "category": "links",
    "name": "反向链接",
    "desc": "列出反向链接",
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
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "tsv",
          "json",
          "csv"
        ],
        "required": false
      },
      {
        "name": "counts",
        "label": "数量",
        "type": "flag",
        "required": false
      },
      {
        "name": "total",
        "label": "仅总数",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "links",
    "category": "links",
    "name": "出站链接",
    "desc": "列出出站链接",
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
        "label": "仅总数",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "unresolved",
    "category": "links",
    "name": "未解析链接",
    "desc": "列出断链",
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
        "required": false
      },
      {
        "name": "total",
        "label": "仅总数",
        "type": "flag",
        "required": false
      },
      {
        "name": "counts",
        "label": "数量",
        "type": "flag",
        "required": false
      },
      {
        "name": "verbose",
        "label": "源文件",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "orphans",
    "category": "links",
    "name": "孤立笔记（整库）",
    "desc": "整库中没有被引用的文件",
    "params": [
      {
        "name": "total",
        "label": "仅总数",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "orphans:folder",
    "category": "links",
    "name": "孤立笔记（按文件夹）",
    "desc": "指定文件夹内既无入链也无出链的文件（虚拟命令）",
    "isVirtual": false,
    "params": [
      {
        "name": "folder",
        "label": "文件夹路径",
        "type": "text",
        "required": true,
        "placeholder": "例如 Projects 或 Notes/Archive"
      },
      {
        "name": "ext",
        "label": "扩展名过滤",
        "type": "text",
        "required": false,
        "placeholder": "留空=仅md，all=全部，或指定如jpg,png"
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
    "id": "deadends",
    "category": "links",
    "name": "死胡同笔记",
    "desc": "没有出站链接的文件",
    "params": [
      {
        "name": "total",
        "label": "仅总数",
        "type": "flag",
        "required": false
      }
    ]
  }
];