// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const filesCommands: CLICommandDefinition[] = [
  {
    "id": "file",
    "category": "files",
    "name": "文件信息",
    "desc": "显示文件详细信息",
    "params": [
      {
        "name": "file",
        "label": "文件名",
        "type": "text",
        "required": false,
        "placeholder": "留空=当前文件"
      },
      {
        "name": "path",
        "label": "文件路径",
        "type": "text",
        "required": false,
        "placeholder": "folder/note.md"
      }
    ]
  },
  {
    "id": "files",
    "category": "files",
    "name": "列出文件",
    "desc": "列出仓库中的文件",
    "params": [
      {
        "name": "folder",
        "label": "文件夹",
        "type": "text",
        "required": false
      },
      {
        "name": "ext",
        "label": "扩展名",
        "type": "text",
        "required": false,
        "placeholder": "md"
      },
      {
        "name": "total",
        "label": "仅显示数量",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "open",
    "category": "files",
    "name": "打开文件",
    "desc": "打开指定文件",
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
        "name": "newtab",
        "label": "新标签页",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "create",
    "category": "files",
    "name": "创建文件",
    "desc": "创建新文件",
    "params": [
      {
        "name": "name",
        "label": "文件名",
        "type": "text",
        "required": false,
        "placeholder": "留空则为 Untitled"
      },
      {
        "name": "path",
        "label": "完整路径",
        "type": "text",
        "required": false,
        "placeholder": "文件夹/文件名.md"
      },
      {
        "name": "content",
        "label": "内容",
        "type": "textarea",
        "required": false,
        "placeholder": "支持换行（Enter 键），将自动转为 \\n"
      },
      {
        "name": "template",
        "label": "模板路径",
        "type": "text",
        "required": false,
        "placeholder": "需要开启\"模板\"核心插件"
      },
      {
        "name": "overwrite",
        "label": "覆盖已有",
        "type": "flag",
        "required": false
      },
      {
        "name": "open",
        "label": "创建后打开",
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
    "id": "read",
    "category": "files",
    "name": "读取文件",
    "desc": "读取文件内容",
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
    "id": "append",
    "category": "files",
    "name": "追加内容",
    "desc": "向文件末尾追加",
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
        "name": "content",
        "label": "内容",
        "type": "textarea",
        "required": false
      },
      {
        "name": "inline",
        "label": "不换行",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "prepend",
    "category": "files",
    "name": "插入到开头",
    "desc": "在frontmatter后插入",
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
        "name": "content",
        "label": "内容",
        "type": "textarea",
        "required": false
      },
      {
        "name": "inline",
        "label": "不换行",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "move",
    "category": "files",
    "name": "移动文件",
    "desc": "移动或重命名文件",
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
        "name": "to",
        "label": "目标路径",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "rename",
    "category": "files",
    "name": "重命名",
    "desc": "重命名文件",
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
        "name": "name",
        "label": "新名称",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "delete",
    "category": "files",
    "name": "删除文件",
    "desc": "删除文件（默认回收站）",
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
        "name": "permanent",
        "label": "永久删除",
        "type": "flag",
        "required": false
      }
    ],
    "dangerous": false
  },
  {
    "id": "folder",
    "category": "files",
    "name": "文件夹信息",
    "desc": "显示文件夹信息",
    "params": [
      {
        "name": "path",
        "label": "路径",
        "type": "text",
        "required": false
      },
      {
        "name": "info",
        "label": "类型",
        "type": "select",
        "options": [
          "files",
          "folders",
          "size"
        ],
        "required": false
      }
    ]
  },
  {
    "id": "folders",
    "category": "files",
    "name": "列出文件夹",
    "desc": "列出仓库文件夹",
    "params": [
      {
        "name": "folder",
        "label": "父文件夹",
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
    "id": "wordcount",
    "category": "files",
    "name": "字数统计",
    "desc": "统计字数和字符数",
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
        "name": "words",
        "label": "仅字数",
        "type": "flag",
        "required": false
      },
      {
        "name": "characters",
        "label": "仅字符数",
        "type": "flag",
        "required": false
      }
    ]
  }
];