import type { BuiltinPresetDefinition } from "../../types";

export const BUILTIN_PRESETS: BuiltinPresetDefinition[] = [
  {
    id: "p-append",
    name: "快速记录想法",
    desc: "向今日日记追加记录",
    commandId: "daily:append",
    defaultParams: { open: false },
    quickInput: {
      param: "content",
      placeholder: "输入想法（Enter执行/Shift+Enter换行）...",
    },
  },
  {
    id: "p-tasks",
    name: "今日待办",
    desc: "今日日记未完成任务",
    commandId: "tasks",
    defaultParams: { daily: true, todo: true },
    quickInput: null,
  },
  {
    id: "p-unresolved",
    name: "查找断链",
    desc: "未解析链接",
    commandId: "unresolved",
    defaultParams: { verbose: true },
    quickInput: null,
  },
  {
    id: "p-alltasks",
    name: "全部待办",
    desc: "所有未完成任务",
    commandId: "tasks",
    defaultParams: { todo: true, verbose: true },
    quickInput: null,
  },
  {
    id: "p-tpl",
    name: "从模板创建",
    desc: "使用模板创建笔记",
    commandId: "create",
    defaultParams: { open: true },
    quickInput: { param: "template", placeholder: "模板名..." },
  },
];
