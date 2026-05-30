// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const publishCommands: CLICommandDefinition[] = [
  {
    "id": "publish:site",
    "category": "publish",
    "name": "站点信息",
    "desc": "发布站点信息",
    "params": []
  },
  {
    "id": "publish:list",
    "category": "publish",
    "name": "已发布文件",
    "desc": "已发布的文件",
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
    "id": "publish:status",
    "category": "publish",
    "name": "发布状态",
    "desc": "发布变更",
    "params": [
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": true
      },
      {
        "name": "new",
        "label": "新文件",
        "type": "flag",
        "required": true
      },
      {
        "name": "changed",
        "label": "已修改",
        "type": "flag",
        "required": true
      },
      {
        "name": "deleted",
        "label": "已删除",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "publish:add",
    "category": "publish",
    "name": "发布文件",
    "desc": "发布文件",
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
        "name": "changed",
        "label": "所有变更",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "publish:remove",
    "category": "publish",
    "name": "取消发布",
    "desc": "取消发布",
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
      }
    ]
  },
  {
    "id": "publish:open",
    "category": "publish",
    "name": "在线预览",
    "desc": "在发布站点打开",
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
      }
    ]
  }
];
