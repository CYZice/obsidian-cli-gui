/**
 * CLI Commander - 插件入口
 * 重构后的模块化结构
 */

const obsidian = require("obsidian");

// Shared 层
const { CLI_CATEGORIES } = require("./shared/constants/categories");
const { CLI_COMMANDS } = require("./shared/constants/commands");
const { BUILTIN_PRESETS } = require("./shared/constants/presets");
const { DEFAULT_SETTINGS } = require("./shared/constants/defaults");
const { compareVersions, generateSecureHash, generateSimpleHash } = require("./shared/utils/hash");
const { getNewNoteFolderPath, getUniqueUntitledPath } = require("./shared/utils/path");

// Domain 层
const { resolveTemplateVars, formatScheduleDesc, buildCommandString } = require("./domain/commands/builder");
const { executeCLI } = require("./domain/commands/executor");
const { startScheduler, checkSchedules } = require("./domain/scheduler");

// Infrastructure 层
const { loadSettings, saveSettings } = require("./infrastructure/persistence/settings");

// UI 层 - 视图
const { CLICommanderView, VIEW_TYPE } = require("./ui/views/CLICommanderView");

// UI 层 - 组件
const { ConfirmModal } = require("./ui/components/modals/ConfirmModal");
const { ResultModal } = require("./ui/components/modals/ResultModal");
const { QuickInputModal } = require("./ui/components/modals/QuickInputModal");
const { SavePresetModal } = require("./ui/components/modals/SavePresetModal");
const { WorkflowEditorModal, WorkflowResultModal } = require("./ui/components/modals/WorkflowModals");
const { getCategoryIcon, setIcon } = require("./ui/components/common/icon");
const { formatTime } = require("./ui/components/common/datetime");
const { CLICommanderSettingTab } = require("./ui/setting-tab/CLICommanderSettingTab");

// 导出给 main.js 使用
module.exports = {
  obsidian,
  CLI_CATEGORIES,
  CLI_COMMANDS,
  BUILTIN_PRESETS,
  DEFAULT_SETTINGS,
  compareVersions,
  generateSecureHash,
  generateSimpleHash,
  getNewNoteFolderPath,
  getUniqueUntitledPath,
  resolveTemplateVars,
  formatScheduleDesc,
  buildCommandString,
  getCategoryIcon,
  setIcon,
  formatTime,
  CLICommanderView,
  VIEW_TYPE,
  ConfirmModal,
  ResultModal,
  QuickInputModal,
  SavePresetModal,
  WorkflowEditorModal,
  WorkflowResultModal,
  CLICommanderSettingTab,
  loadSettings,
  saveSettings,
  startScheduler,
  executeCLI,
};

// 重新导出
module.exports.CLICommanderPlugin = require("./plugin/index").CLICommanderPlugin;