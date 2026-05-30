import { CLI_CATEGORIES } from "./shared/constants/categories";
import { CLI_COMMANDS } from "./shared/constants/commands";
import { DEFAULT_SETTINGS } from "./shared/constants/defaults";
import { BUILTIN_PRESETS } from "./shared/constants/presets";
import { executeCLI } from "./domain/commands/executor";
import { buildCommandString, formatScheduleDesc, resolveTemplateVars } from "./domain/commands/builder";
import { loadSettings, saveSettings } from "./infrastructure/persistence/settings";
import { CLICommanderPlugin, VIEW_TYPE } from "./plugin";
import { startScheduler } from "./domain/scheduler";
import { CLICommanderView } from "./ui/views/CLICommanderView";
import { CLICommanderSettingTab } from "./ui/setting-tab/CLICommanderSettingTab";
import { ConfirmModal } from "./ui/components/modals/ConfirmModal";
import { QuickInputModal } from "./ui/components/modals/QuickInputModal";
import { ResultModal } from "./ui/components/modals/ResultModal";
import { SavePresetModal } from "./ui/components/modals/SavePresetModal";
import { WorkflowEditorModal, WorkflowResultModal } from "./ui/components/modals/WorkflowModals";
import { formatTime } from "./ui/components/common/datetime";
import { getCategoryIcon, setIcon } from "./ui/components/common/icon";
import { compareVersions, generateSecureHash, generateSimpleHash, getNewNoteFolderPath, getUniqueUntitledPath } from "./shared/utils";

export default CLICommanderPlugin;

export {
  BUILTIN_PRESETS,
  CLI_CATEGORIES,
  CLI_COMMANDS,
  CLICommanderPlugin,
  CLICommanderSettingTab,
  CLICommanderView,
  ConfirmModal,
  DEFAULT_SETTINGS,
  QuickInputModal,
  ResultModal,
  SavePresetModal,
  VIEW_TYPE,
  WorkflowEditorModal,
  WorkflowResultModal,
  buildCommandString,
  compareVersions,
  executeCLI,
  formatScheduleDesc,
  formatTime,
  generateSecureHash,
  generateSimpleHash,
  getCategoryIcon,
  getNewNoteFolderPath,
  getUniqueUntitledPath,
  loadSettings,
  resolveTemplateVars,
  saveSettings,
  setIcon,
  startScheduler,
};
