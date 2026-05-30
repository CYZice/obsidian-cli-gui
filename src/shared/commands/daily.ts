// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const dailyCommands: CLICommandDefinition[] = [
  {
    "id": "daily",
    "category": "daily",
    "name": "打开日记",
    "desc": "打开今日每日笔记",
    "params": [
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
      }
    ]
  },
  {
    "id": "daily:path",
    "category": "daily",
    "name": "获取日记路径",
    "desc": "获取今日日记文件路径",
    "params": []
  },
  {
    "id": "daily:read",
    "category": "daily",
    "name": "读取日记",
    "desc": "读取今日日记内容",
    "params": []
  },
  {
    "id": "daily:append",
    "category": "daily",
    "name": "追加到日记",
    "desc": "向今日日记末尾追加内容",
    "params": [
      {
        "name": "content",
        "label": "内容",
        "type": "textarea",
        "required": false,
        "placeholder": "输入要追加的内容..."
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
        "name": "inline",
        "label": "不换行追加",
        "type": "flag",
        "required": true
      },
      {
        "name": "open",
        "label": "执行后打开",
        "type": "flag",
        "required": true
      }
    ]
  },
  {
    "id": "daily:prepend",
    "category": "daily",
    "name": "插入到日记开头",
    "desc": "向今日日记开头插入内容",
    "params": [
      {
        "name": "content",
        "label": "内容",
        "type": "textarea",
        "required": false,
        "placeholder": "输入要插入的内容..."
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
        "name": "inline",
        "label": "不换行插入",
        "type": "flag",
        "required": true
      },
      {
        "name": "open",
        "label": "执行后打开",
        "type": "flag",
        "required": true
      }
    ]
  }
];
