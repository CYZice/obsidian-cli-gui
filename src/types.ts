import type { App, Plugin, TFile, WorkspaceLeaf } from "obsidian";

export type CLICommandParamType = "text" | "textarea" | "number" | "flag" | "select";

export interface CLICommandParamOption {
  label: string;
  value: string;
}

export interface CLICommandParamDefinition {
  name: string;
  label?: string;
  desc?: string;
  placeholder?: string;
  type: CLICommandParamType;
  required?: boolean;
  options?: CLICommandParamOption[];
}

export interface CLICommandDefinition {
  id: string;
  category: string;
  name: string;
  desc?: string;
  dangerous?: boolean;
  params: CLICommandParamDefinition[];
}

export interface CLICategoryDefinition {
  id: string;
  name: string;
  desc?: string;
  icon: string;
}

export interface PresetQuickInputDefinition {
  param: string;
  label?: string;
  type?: "input" | "textarea";
  placeholder?: string;
}

export interface BuiltinPresetDefinition {
  id: string;
  name: string;
  desc?: string;
  lucideIcon?: string;
  commandId: string;
  defaultParams: Record<string, unknown>;
  quickInput?: PresetQuickInputDefinition | null;
}

export interface UserPresetDefinition {
  name: string;
  desc?: string;
  lucideIcon?: string;
  commandId?: string;
  command: string;
  params?: Record<string, unknown>;
  quickInputs?: PresetQuickInputDefinition[] | null;
  group?: string;
  createdAt?: number;
}

export interface WorkflowSchedule {
  enabled: boolean;
  type: "daily" | "weekly" | "interval";
  time?: string;
  weekday?: number;
  intervalMin?: number;
}

export interface WorkflowStep {
  command: string;
  label?: string;
  sleep?: number;
  continueOnError?: boolean;
  usePrev?: boolean;
  batchMode?: boolean;
  isEval?: boolean;
  baseCommand?: string;
}

export interface WorkflowDefinition {
  name: string;
  steps: WorkflowStep[];
  schedule?: WorkflowSchedule | null;
  group?: string;
}

export interface WorkflowRunResultItem {
  step: number;
  command: string;
  result: string;
  success: boolean;
}

export interface WorkflowRunResult {
  results: WorkflowRunResultItem[];
  combined: string;
  success: boolean;
}

export interface EvalSnippetDefinition {
  name: string;
  code: string;
  group?: string;
}

export interface ExecutionHistoryEntry {
  command: string;
  commandId?: string;
  commandName?: string;
  result: string;
  success: boolean;
  timestamp: number;
  workflow?: WorkflowDefinition;
}

export interface CLICommanderSettings {
  userPresets: UserPresetDefinition[];
  userPresetGroups: string[];
  presetGroupCollapsed: Record<string, boolean>;
  workflowGroups: string[];
  wfGroupCollapsed: Record<string, boolean>;
  workflows: WorkflowDefinition[];
  executionHistory: ExecutionHistoryEntry[];
  maxHistory: number;
  showCommandPreview: boolean;
  confirmDangerous: boolean;
  favorites: string[];
  hiddenBuiltinPresets: string[];
  builtinPresetOrder: string[];
  homePresetIds: string[] | null;
  evalLastCode: string;
  evalSnippets: EvalSnippetDefinition[];
  evalSnippetGroups: string[];
  evalSnippetGroupCollapsed: Record<string, boolean>;
  moveConflictRename: boolean;
  moveConflictSuffix: "number" | "timestamp";
  showResultPanel: boolean;
}

export interface CLIExecutionContext {
  __workflowContext?: string;
  [key: string]: string | undefined;
}

export interface RunAgentTaskOptions {
  filePath?: string;
  folderPath?: string;
  assistantId?: string;
}

export interface RunAgentTaskResult {
  success: boolean;
  message: string;
}

export interface YoloPlugin {
  runAgentTask(content: string, options: RunAgentTaskOptions): Promise<RunAgentTaskResult>;
}

export interface CLICommanderViewLike {
  _showResult(result: string, isError: boolean): void;
  _addHistory(
    command: string,
    commandMeta: { id: string; name: string },
    result: string,
    success: boolean,
    workflow?: WorkflowDefinition,
  ): void;
}

export interface CLICommanderPluginInstance extends Plugin {
  app: App;
  settings: CLICommanderSettings;
  _schedTimer: ReturnType<typeof setInterval> | null;
  _schedRan?: Set<string>;
  _obsidianBin?: string;
  _agentRunning?: boolean;
  loadSettings(): Promise<void>;
  saveSettings(): Promise<void>;
  activateView(): Promise<void>;
  executeCLI(command: string, options?: CLIExecutionContext): Promise<string>;
  runWorkflow(workflow: WorkflowDefinition): Promise<WorkflowRunResult>;
}

export interface SavePresetPayload extends UserPresetDefinition {}

export interface TemplateContext {
  workspace?: {
    getActiveFile?: () => TFile | null;
  };
}

export interface NewNoteFolderContext {
  vault?: {
    getConfig?: (key: string) => unknown;
    config?: Record<string, unknown>;
  };
  workspace?: {
    getActiveFile?: () => TFile | null;
  };
}

export interface AgentViewLeaf {
  view?: CLICommanderViewLike;
}

export interface WorkspaceWithViewLeaf extends WorkspaceLeaf {
  view?: CLICommanderViewLike;
}
