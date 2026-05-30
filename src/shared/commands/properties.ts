// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const propertiesCommands: CLICommandDefinition[] = [
  {
    "id": "properties",
    "category": "properties",
    "name": "列出属性",
    "desc": "列出仓库属性",
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
        "label": "属性名",
        "type": "text",
        "required": false
      },
      {
        "name": "sort",
        "label": "排序",
        "type": "select",
        "options": [
          "name",
          "count"
        ],
        "required": false
      },
      {
        "name": "format",
        "label": "格式",
        "type": "select",
        "options": [
          "yaml",
          "json",
          "tsv"
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
        "name": "active",
        "label": "当前文件",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "property:set",
    "category": "properties",
    "name": "设置属性",
    "desc": "设置文件属性",
    "params": [
      {
        "name": "name",
        "label": "属性名",
        "type": "text",
        "required": true
      },
      {
        "name": "value",
        "label": "属性值",
        "type": "text",
        "required": true
      },
      {
        "name": "type",
        "label": "类型",
        "type": "select",
        "options": [
          "text",
          "list",
          "number",
          "checkbox",
          "date",
          "datetime"
        ],
        "required": false
      },
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
    "id": "property:remove",
    "category": "properties",
    "name": "删除属性",
    "desc": "删除文件属性",
    "params": [
      {
        "name": "name",
        "label": "属性名",
        "type": "text",
        "required": true
      },
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
    "id": "property:read",
    "category": "properties",
    "name": "读取属性",
    "desc": "读取属性值",
    "params": [
      {
        "name": "name",
        "label": "属性名",
        "type": "text",
        "required": true
      },
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
  }
];