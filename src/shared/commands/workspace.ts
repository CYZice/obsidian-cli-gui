// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const workspaceCommands: CLICommandDefinition[] = [
  {
    "id": "workspace",
    "category": "workspace",
    "name": "工作区树",
    "desc": "当前工作区布局",
    "params": [
      {
        "name": "ids",
        "label": "显示ID",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "workspaces",
    "category": "workspace",
    "name": "列出工作区",
    "desc": "已保存工作区",
    "params": [
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      }
    ]
  },
  {
    "id": "workspace:save",
    "category": "workspace",
    "name": "保存工作区",
    "desc": "保存当前布局",
    "params": [
      {
        "name": "name",
        "label": "名称",
        "type": "text",
        "required": true
      }
    ]
  },
  {
    "id": "workspace:load",
    "category": "workspace",
    "name": "加载工作区",
    "desc": "加载工作区",
    "params": [
      {
        "name": "name",
        "label": "名称",
        "type": "text",
        "required": true
      }
    ]
  },
  {
    "id": "workspace:delete",
    "category": "workspace",
    "name": "删除工作区",
    "desc": "删除工作区",
    "params": [
      {
        "name": "name",
        "label": "名称",
        "type": "text",
        "required": true
      }
    ],
    "dangerous": true
  },
  {
    "id": "tabs",
    "category": "workspace",
    "name": "标签页",
    "desc": "列出打开的标签页",
    "params": []
  },
  {
    "id": "tab:open",
    "category": "workspace",
    "name": "打开标签页",
    "desc": "打开新标签页",
    "params": [
      {
        "name": "group",
        "label": "标签组",
        "type": "text",
        "required": false
      },
      {
        "name": "file",
        "label": "文件",
        "type": "text",
        "required": false
      },
      {
        "name": "view",
        "label": "视图",
        "type": "text",
        "required": false
      }
    ]
  },
  {
    "id": "recents",
    "category": "workspace",
    "name": "最近文件",
    "desc": "最近打开的文件",
    "params": [
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      }
    ]
  }
];