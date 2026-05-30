// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const templatesCommands: CLICommandDefinition[] = [
  {
    "id": "templates",
    "category": "templates",
    "name": "列出模板",
    "desc": "列出所有模板",
    "params": [
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "template:read",
    "category": "templates",
    "name": "读取模板",
    "desc": "读取模板内容",
    "params": [
      {
        "name": "name",
        "label": "模板名",
        "type": "text",
        "required": false
      },
      {
        "name": "title",
        "label": "标题变量",
        "type": "text",
        "required": true
      },
      {
        "name": "resolve",
        "label": "解析变量",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "template:insert",
    "category": "templates",
    "name": "插入模板",
    "desc": "插入模板到当前文件",
    "params": [
      {
        "name": "name",
        "label": "模板名",
        "type": "text",
        "required": false,
        "placeholder": "需要开启\"模板\"核心插件"
      }
    ]
  }
];
