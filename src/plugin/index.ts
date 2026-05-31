import { Notice, Plugin, type ItemView, type Menu, type WorkspaceLeaf, TFile } from "obsidian";
import { CLI_COMMANDS } from "../shared/constants/commands";
import { CLICommanderView, VIEW_TYPE } from "../ui/views/CLICommanderView";
import { CLICommanderSettingTab } from "../ui/setting-tab/CLICommanderSettingTab";
import { QuickInputModal } from "../ui/components/modals/QuickInputModal";
import { ResultModal } from "../ui/components/modals/ResultModal";
import { startScheduler } from "../domain/scheduler";
import { executeCLI } from "../domain/commands/executor";
import { loadSettings, saveSettings } from "../infrastructure/persistence/settings";
import { runWorkflow } from "./workflowRunner";
import { importWorkflowsFromFile, exportWorkflowsToFile } from "./workflow/import";
import type {
  CLICommanderPluginInstance,
  CLIExecutionContext,
  WorkflowDefinition,
  WorkflowSourceDefinition,
} from "../types";

export class CLICommanderPlugin extends Plugin implements CLICommanderPluginInstance {
  settings!: CLICommanderPluginInstance["settings"];
  _schedTimer: CLICommanderPluginInstance["_schedTimer"] = null;
  _schedRan?: Set<string>;
  _obsidianBin?: string;
  _agentRunning?: boolean;

  get cliCommands() {
    return CLI_COMMANDS;
  }

  async loadSettings(): Promise<void> {
    this.settings = await loadSettings(this);
  }

  async saveSettings(): Promise<void> {
    await saveSettings(this, this.settings);
  }

  async initializePluginFeatures(): Promise<void> {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf: WorkspaceLeaf) => new CLICommanderView(leaf, this) as unknown as ItemView);
    this.addRibbonIcon("waypoints", "CLI Commander", () => {
      void this.activateView();
    });

    this.addCommand({
      id: "open-cli-commander",
      name: "打开 CLI Commander",
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: "quick-daily-append",
      name: "快速追加到日记",
      callback: () => {
        new QuickInputModal(
          this.app,
          this,
          "快速记录",
          "输入要追加到今日日记的内容...",
          async (value: string) => {
            const command = `obsidian daily:append content="${value.replace(/"/g, '\\"')}"`;
            try {
              await this.executeCLI(command);
              new Notice("✅ 已追加到日记");
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              new Notice(`❌ 失败: ${message}`);
            }
          },
        ).open();
      },
    });

    this.addCommand({
      id: "quick-search",
      name: "快速搜索",
      callback: () => {
        new QuickInputModal(
          this.app,
          this,
          "全库搜索",
          "输入搜索关键词...",
          async (value: string) => {
            const command = `obsidian search:context query="${value.replace(/"/g, '\\"')}"`;
            try {
              const result = await this.executeCLI(command);
              new ResultModal(this.app, command, result).open();
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              new Notice(`❌ 失败: ${message}`);
            }
          },
        ).open();
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", ((menu: Menu, file: TFile) => {
        this.registerFileMenuItem(menu, file, "CLI: 查看文件信息", "waypoints", `obsidian file path="${file.path}"`);
        this.registerFileMenuItem(
          menu,
          file,
          "CLI: 查看反向链接",
          "links-going-out",
          `obsidian backlinks path="${file.path}" counts`,
        );
        this.registerFileMenuItem(menu, file, "CLI: 字数统计", "file-text", `obsidian wordcount path="${file.path}"`);
      }) as (...args: unknown[]) => void),
    );

    this.addSettingTab(new CLICommanderSettingTab(this.app, this));
    this.registerWorkflowFileListener();
    startScheduler(this);
  }

  private registerFileMenuItem(menu: Menu, _file: TFile, title: string, icon: string, command: string): void {
    menu.addItem((item) =>
      item.setTitle(title).setIcon(icon).onClick(async () => {
        try {
          const result = await this.executeCLI(command);
          new ResultModal(this.app, command, result).open();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          new Notice(`❌ 失败: ${message}`);
        }
      }),
    );
  }

  async onload(): Promise<void> {
    try {
      await this.initializePluginFeatures();
    } catch (error) {
      console.error("[CLI Commander] 插件加载失败", error);
      new Notice("CLI Commander 加载失败，请打开开发者控制台查看错误");
    }
  }

  onunload(): void {
    if (this._schedTimer) {
      clearInterval(this._schedTimer);
      this._schedTimer = null;
    }
  }

  async activateView(): Promise<void> {
    const workspace = this.app.workspace;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE)[0];

    if (!leaf) {
      const leftLeaf = workspace.getLeftLeaf(false);
      if (leftLeaf) {
        leaf = leftLeaf;
        await leaf.setViewState({
          type: VIEW_TYPE,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  async executeCLI(command: string, options?: CLIExecutionContext): Promise<string> {
    return executeCLI(this, command, options);
  }

  async runWorkflow(workflow: WorkflowDefinition) {
    return runWorkflow(this, workflow);
  }

  getAllWorkflows(): WorkflowDefinition[] {
    const manual = this.settings.manualWorkflows || [];
    const imported = this.settings.workflowSources
      .filter((s) => s.enabled && s.lastError === null)
      .flatMap((s) => (s as unknown as { workflows?: WorkflowDefinition[] }).workflows || []);
    return [...manual, ...imported];
  }

  async addWorkflowSource(filePath: string): Promise<number> {
    const { workflows, error } = await importWorkflowsFromFile(this, filePath);

    const existingIndex = this.settings.workflowSources.findIndex((s) => s.path === filePath);
    const source: WorkflowSourceDefinition = {
      path: filePath,
      enabled: true,
      format: "json",
      lastLoadedAt: Date.now(),
      lastError: error || null,
    };

    if (error) {
      source.lastError = error;
      if (existingIndex >= 0) {
        this.settings.workflowSources[existingIndex] = source;
      } else {
        this.settings.workflowSources.push(source);
      }
      await this.saveSettings();
      return 0;
    }

    // Store workflows directly on the source for quick access
    (source as unknown as { workflows: WorkflowDefinition[] }).workflows = workflows;

    if (existingIndex >= 0) {
      this.settings.workflowSources[existingIndex] = source;
    } else {
      this.settings.workflowSources.push(source);
    }
    await this.saveSettings();
    return workflows.length;
  }

  async reloadWorkflowSources(): Promise<void> {
    const updatedSources: WorkflowSourceDefinition[] = [];
    for (const source of this.settings.workflowSources) {
      const { workflows, error } = await importWorkflowsFromFile(this, source.path);
      const updated: WorkflowSourceDefinition = {
        ...source,
        lastLoadedAt: Date.now(),
        lastError: error || null,
      };
      if (!error) {
        (updated as unknown as { workflows: WorkflowDefinition[] }).workflows = workflows;
      }
      updatedSources.push(updated);
    }
    this.settings.workflowSources = updatedSources;
    await this.saveSettings();
  }

  async exportWorkflowsToFile(
    filePath: string,
    options?: { source?: "manual" | "all" }
  ): Promise<void> {
    await exportWorkflowsToFile(this, filePath, options);
  }

  private registerWorkflowFileListener(): void {
    this.registerEvent(
      this.app.vault.on("modify", async (file) => {
        if (!(file instanceof TFile) || !file.path.endsWith(".json")) {
          return;
        }
        const isSource = this.settings.workflowSources.some((s) => s.path === file.path);
        if (!isSource) {
          return;
        }
        await this.reloadWorkflowSources();
        new Notice("🔄 Workflow 文件已重新加载");
      })
    );
  }
}

export { VIEW_TYPE };
