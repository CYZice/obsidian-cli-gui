// @ts-nocheck
import type { CLICommandDefinition } from "../../types";

export const vaultCommands: CLICommandDefinition[] = [
  {
    "id": "vault",
    "category": "vault",
    "name": "仓库信息",
    "desc": "当前仓库信息",
    "params": [
      {
        "name": "info",
        "label": "类型",
        "type": "select",
        "options": [
          "name",
          "path",
          "files",
          "folders",
          "size"
        ],
        "required": false
      }
    ]
  },
  {
    "id": "vaults",
    "category": "vault",
    "name": "列出仓库",
    "desc": "所有已知仓库",
    "params": [
      {
        "name": "total",
        "label": "仅数量",
        "type": "flag",
        "required": false
      },
      {
        "name": "verbose",
        "label": "路径",
        "type": "flag",
        "required": false
      }
    ]
  }
];