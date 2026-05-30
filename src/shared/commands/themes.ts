// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const themesCommands: CLICommandDefinition[] = [
  {
    "id": "themes",
    "category": "themes",
    "name": "列出主题",
    "desc": "列出已安装主题",
    "params": [
      {
        "name": "versions",
        "label": "版本",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "theme",
    "category": "themes",
    "name": "当前主题",
    "desc": "查看当前主题",
    "params": [
      {
        "name": "name",
        "label": "主题名",
        "type": "text",
        "required": true
      }
    ]
  },
  {
    "id": "theme:set",
    "category": "themes",
    "name": "设置主题",
    "desc": "切换主题",
    "params": [
      {
        "name": "name",
        "label": "主题名",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "theme:install",
    "category": "themes",
    "name": "安装主题",
    "desc": "安装社区主题",
    "params": [
      {
        "name": "name",
        "label": "主题名",
        "type": "text",
        "required": false
      },
      {
        "name": "enable",
        "label": "安装后启用",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "theme:uninstall",
    "category": "themes",
    "name": "卸载主题",
    "desc": "卸载主题",
    "params": [
      {
        "name": "name",
        "label": "主题名",
        "type": "text",
        "required": false
      }
    ],
    "dangerous": false
  },
  {
    "id": "snippets",
    "category": "themes",
    "name": "CSS片段",
    "desc": "列出CSS片段",
    "params": []
  },
  {
    "id": "snippets:enabled",
    "category": "themes",
    "name": "已启用CSS",
    "desc": "已启用CSS片段",
    "params": []
  },
  {
    "id": "snippet:enable",
    "category": "themes",
    "name": "启用CSS",
    "desc": "启用CSS片段",
    "params": [
      {
        "name": "name",
        "label": "片段名",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "snippet:disable",
    "category": "themes",
    "name": "禁用CSS",
    "desc": "禁用CSS片段",
    "params": [
      {
        "name": "name",
        "label": "片段名",
        "type": "text",
        "required": false
      }
    ]
  }
];
