// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const pluginsCommands: CLICommandDefinition[] = [
  {
    "id": "plugins",
    "category": "plugins",
    "name": "列出插件",
    "desc": "列出已安装插件",
    "params": [
      {
        "name": "filter",
        "label": "类型",
        "type": "select",
        "options": [
          "core",
          "community"
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
        "name": "versions",
        "label": "版本",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "plugins:enabled",
    "category": "plugins",
    "name": "已启用插件",
    "desc": "列出已启用插件",
    "params": [
      {
        "name": "filter",
        "label": "类型",
        "type": "select",
        "options": [
          "core",
          "community"
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
        "name": "versions",
        "label": "版本",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "plugin",
    "category": "plugins",
    "name": "插件信息",
    "desc": "查看插件详情",
    "params": [
      {
        "name": "id",
        "label": "插件ID",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "plugin:enable",
    "category": "plugins",
    "name": "启用插件",
    "desc": "启用插件",
    "params": [
      {
        "name": "id",
        "label": "插件ID",
        "type": "text",
        "required": false
      },
      {
        "name": "filter",
        "label": "类型",
        "type": "select",
        "options": [
          "core",
          "community"
        ],
        "required": true
      }
    ]
  },
  {
    "id": "plugin:disable",
    "category": "plugins",
    "name": "禁用插件",
    "desc": "禁用插件",
    "params": [
      {
        "name": "id",
        "label": "插件ID",
        "type": "text",
        "required": false
      },
      {
        "name": "filter",
        "label": "类型",
        "type": "select",
        "options": [
          "core",
          "community"
        ],
        "required": true
      }
    ]
  },
  {
    "id": "plugin:install",
    "category": "plugins",
    "name": "安装插件",
    "desc": "安装社区插件",
    "params": [
      {
        "name": "id",
        "label": "插件ID",
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
    "id": "plugin:uninstall",
    "category": "plugins",
    "name": "卸载插件",
    "desc": "卸载插件",
    "params": [
      {
        "name": "id",
        "label": "插件ID",
        "type": "text",
        "required": false
      }
    ],
    "dangerous": false
  },
  {
    "id": "plugin:reload",
    "category": "plugins",
    "name": "重载插件",
    "desc": "重载插件（开发用）",
    "params": [
      {
        "name": "id",
        "label": "插件ID",
        "type": "text",
        "required": false
      }
    ]
  }
];
