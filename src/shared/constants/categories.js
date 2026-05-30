const CLI_CATEGORIES = [
  { id: "daily", name: "日记", desc: "每日笔记相关操作", icon: "calendar-days" },
  { id: "files", name: "文件", desc: "文件与文件夹管理", icon: "file-text" },
  { id: "search", name: "搜索", desc: "全库搜索与检索", icon: "search" },
  { id: "tasks", name: "任务", desc: "任务管理与追踪", icon: "check-square" },
  { id: "links", name: "链接", desc: "链接与反向链接", icon: "link" },
  { id: "tags", name: "标签", desc: "标签管理", icon: "tag" },
  { id: "properties", name: "属性", desc: "文件属性管理", icon: "info" },
  { id: "templates", name: "模板", desc: "模板操作", icon: "layout-template" },
  { id: "bookmarks", name: "书签", desc: "书签管理", icon: "bookmark" },
  { id: "plugins", name: "插件", desc: "插件管理", icon: "puzzle" },
  { id: "themes", name: "主题", desc: "主题与样式", icon: "palette" },
  { id: "vault", name: "仓库", desc: "仓库信息与管理", icon: "vault" },
  { id: "workspace", name: "工作区", desc: "工作区与标签页", icon: "layout-dashboard" },
  { id: "publish", name: "发布", desc: "Obsidian Publish", icon: "globe" },
  { id: "sync", name: "同步", desc: "Obsidian Sync", icon: "refresh-cw" },
  { id: "history", name: "历史", desc: "文件历史与版本", icon: "history" },
  { id: "dev", name: "开发者", desc: "开发者工具", icon: "code-2" },
  { id: "base", name: "数据库", desc: "Bases 数据库管理", icon: "database" },
  { id: "other", name: "其他", desc: "其他命令", icon: "settings" },
  { id: "agent", name: "Agent", desc: "调用 FlowText Agent 智能助手", icon: "sparkles" },
];

module.exports = { CLI_CATEGORIES };