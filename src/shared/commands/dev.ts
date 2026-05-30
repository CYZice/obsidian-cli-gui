// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const devCommands: CLICommandDefinition[] = [
  {
    "id": "devtools",
    "category": "dev",
    "name": "开发者工具",
    "desc": "切换开发者工具",
    "params": []
  },
  {
    "id": "dev:debug",
    "category": "dev",
    "name": "调试器",
    "desc": "连接/断开调试器",
    "params": [
      {
        "name": "on",
        "label": "连接",
        "type": "flag",
        "required": false
      },
      {
        "name": "off",
        "label": "断开",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "dev:cdp",
    "category": "dev",
    "name": "CDP命令",
    "desc": "执行CDP命令",
    "params": [
      {
        "name": "method",
        "label": "方法",
        "type": "text",
        "required": false
      },
      {
        "name": "params",
        "label": "参数JSON",
        "type": "textarea",
        "required": false
      }
    ]
  },
  {
    "id": "dev:errors",
    "category": "dev",
    "name": "错误日志",
    "desc": "查看JS错误",
    "params": [
      {
        "name": "clear",
        "label": "清除",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "dev:screenshot",
    "category": "dev",
    "name": "截图",
    "desc": "截取应用截图",
    "params": [
      {
        "name": "path",
        "label": "保存路径",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "dev:console",
    "category": "dev",
    "name": "控制台",
    "desc": "查看控制台消息",
    "params": [
      {
        "name": "limit",
        "label": "最大数",
        "type": "number",
        "required": false
      },
      {
        "name": "level",
        "label": "级别",
        "type": "select",
        "options": [
          "log",
          "warn",
          "error",
          "info",
          "debug"
        ],
        "required": false
      },
      {
        "name": "clear",
        "label": "清除",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "dev:css",
    "category": "dev",
    "name": "CSS检查",
    "desc": "检查CSS样式",
    "params": [
      {
        "name": "selector",
        "label": "选择器",
        "type": "text",
        "required": false
      },
      {
        "name": "prop",
        "label": "属性",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "dev:dom",
    "category": "dev",
    "name": "DOM查询",
    "desc": "查询DOM元素",
    "params": [
      {
        "name": "selector",
        "label": "选择器",
        "type": "text",
        "required": false
      },
      {
        "name": "attr",
        "label": "属性",
        "type": "text",
        "required": false
      },
      {
        "name": "css",
        "label": "CSS属性",
        "type": "text",
        "required": false
      },
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      },
      {
        "name": "text",
        "label": "文本",
        "type": "flag",
        "required": false
      },
      {
        "name": "inner",
        "label": "innerHTML",
        "type": "flag",
        "required": false
      },
      {
        "name": "all",
        "label": "所有",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "dev:mobile",
    "category": "dev",
    "name": "移动端模拟",
    "desc": "切换移动端",
    "params": [
      {
        "name": "on",
        "label": "启用",
        "type": "flag",
        "required": false
      },
      {
        "name": "off",
        "label": "禁用",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "eval",
    "category": "dev",
    "name": "执行JS",
    "desc": "执行JavaScript",
    "params": [
      {
        "name": "code",
        "label": "JS代码",
        "type": "textarea",
        "required": false,
        "placeholder": "app.vault.getFiles().length"
      }
    ]
  }
];