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

const { CLICommanderPlugin } = require("./plugin/index");

// Obsidian 需要主导出为插件类本身，而不是包含插件类的普通对象。
module.exports = CLICommanderPlugin;

// 保留命名属性，避免本地调试或其他模块引用时丢失上下文。
module.exports.obsidian = obsidian;
module.exports.CLI_CATEGORIES = CLI_CATEGORIES;
module.exports.CLI_COMMANDS = CLI_COMMANDS;
module.exports.BUILTIN_PRESETS = BUILTIN_PRESETS;
module.exports.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
module.exports.compareVersions = compareVersions;
module.exports.generateSecureHash = generateSecureHash;
module.exports.generateSimpleHash = generateSimpleHash;
module.exports.getNewNoteFolderPath = getNewNoteFolderPath;
module.exports.getUniqueUntitledPath = getUniqueUntitledPath;
module.exports.resolveTemplateVars = resolveTemplateVars;
module.exports.formatScheduleDesc = formatScheduleDesc;
module.exports.buildCommandString = buildCommandString;
module.exports.getCategoryIcon = getCategoryIcon;
module.exports.setIcon = setIcon;
module.exports.formatTime = formatTime;
module.exports.CLICommanderView = CLICommanderView;
module.exports.VIEW_TYPE = VIEW_TYPE;
module.exports.ConfirmModal = ConfirmModal;
module.exports.ResultModal = ResultModal;
module.exports.QuickInputModal = QuickInputModal;
module.exports.SavePresetModal = SavePresetModal;
module.exports.WorkflowEditorModal = WorkflowEditorModal;
module.exports.WorkflowResultModal = WorkflowResultModal;
module.exports.CLICommanderSettingTab = CLICommanderSettingTab;
module.exports.loadSettings = loadSettings;
module.exports.saveSettings = saveSettings;
module.exports.startScheduler = startScheduler;
module.exports.executeCLI = executeCLI;
module.exports.CLICommanderPlugin = CLICommanderPlugin;
