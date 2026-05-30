// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const otherCommands: CLICommandDefinition[] = [
  {
    "id": "help",
    "category": "other",
    "name": "帮助",
    "desc": "显示帮助",
    "params": []
  },
  {
    "id": "version",
    "category": "other",
    "name": "版本",
    "desc": "Obsidian版本",
    "params": []
  },
  {
    "id": "reload",
    "category": "other",
    "name": "重新加载",
    "desc": "重新加载窗口",
    "params": []
  },
  {
    "id": "restart",
    "category": "other",
    "name": "重启",
    "desc": "重启Obsidian",
    "params": []
  },
  {
    "id": "random",
    "category": "other",
    "name": "随机笔记",
    "desc": "打开随机笔记",
    "params": [
      {
        "name": "folder",
        "label": "文件夹",
        "type": "text",
        "required": true
      },
      {
        "name": "newtab",
        "label": "新标签页",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "random:read",
    "category": "other",
    "name": "读取随机笔记",
    "desc": "读取随机笔记",
    "params": [
      {
        "name": "folder",
        "label": "文件夹",
        "type": "text",
        "required": true
      }
    ]
  },
  {
    "id": "web",
    "category": "other",
    "name": "打开网页",
    "desc": "内置浏览器打开URL",
    "params": [
      {
        "name": "url",
        "label": "URL",
        "type": "text",
        "required": false,
        "placeholder": "https://..."
      },
      {
        "name": "newtab",
        "label": "新标签页",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "outline",
    "category": "other",
    "name": "大纲",
    "desc": "文件标题大纲",
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
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "tree",
          "md",
          "json"
        ],
        "required": true
      },
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "aliases",
    "category": "other",
    "name": "别名",
    "desc": "列出别名",
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
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": true
      },
      {
        "name": "verbose",
        "label": "文件路径",
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
    "id": "commands",
    "category": "other",
    "name": "命令列表",
    "desc": "可用命令ID",
    "params": [
      {
        "name": "filter",
        "label": "前缀",
        "type": "text",
        "required": true
      }
    ]
  },
  {
    "id": "command",
    "category": "other",
    "name": "执行命令",
    "desc": "执行Obsidian命令",
    "params": [
      {
        "name": "id",
        "label": "命令ID",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "hotkeys",
    "category": "other",
    "name": "快捷键",
    "desc": "列出快捷键",
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
        "label": "自定义",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "hotkey",
    "category": "other",
    "name": "查看快捷键",
    "desc": "命令的快捷键",
    "params": [
      {
        "name": "id",
        "label": "命令ID",
        "type": "text",
        "required": false
      },
      {
        "name": "verbose",
        "label": "自定义",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "unique",
    "category": "other",
    "name": "唯一笔记",
    "desc": "创建唯一笔记",
    "params": [
      {
        "name": "name",
        "label": "名称",
        "type": "text",
        "required": true
      },
      {
        "name": "content",
        "label": "内容",
        "type": "textarea",
        "required": true
      },
      {
        "name": "paneType",
        "label": "打开方式",
        "type": "select",
        "options": [
          "tab",
          "split",
          "window"
        ],
        "required": true
      },
      {
        "name": "open",
        "label": "打开",
        "type": "flag",
        "required": true
      }
    ]
  }
];
