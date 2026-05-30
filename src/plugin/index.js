const obsidian = require("obsidian");
const { CLICommanderView, VIEW_TYPE } = require("../ui/views/CLICommanderView");
const { CLICommanderSettingTab } = require("../ui/setting-tab/CLICommanderSettingTab");
const { QuickInputModal } = require("../ui/components/modals/QuickInputModal");
const { ResultModal } = require("../ui/components/modals/ResultModal");
const { startScheduler } = require("../domain/scheduler");
const { executeCLI } = require("../domain/commands/executor");
const { runWorkflow } = require("./workflowRunner");

class CLICommanderPlugin extends obsidian.Plugin {
  get cliCommands() {
    const { CLI_COMMANDS } = require("../shared/constants/commands");
    return CLI_COMMANDS;
  }

  async loadSettings() {
    const { loadSettings } = require("../infrastructure/persistence/settings");
    this.settings = await loadSettings(this);
  }

  async saveSettings() {
    const { saveSettings } = require("../infrastructure/persistence/settings");
    await saveSettings(this, this.settings);
  }

  async initializePluginFeatures() {
    await this.loadSettings();

    this.registerView(VIEW_TYPE, (leaf) => new CLICommanderView(leaf, this));
    this.addRibbonIcon("waypoints", "CLI Commander", () => this.activateView());

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
          async (value) => {
            const cmd = `obsidian daily:append content="${value.replace(/"/g, '\\"')}"`;
            try {
              await this.executeCLI(cmd);
              new obsidian.Notice("✅ 已追加到日记");
            } catch (error) {
              new obsidian.Notice("❌ 失败: " + error.message);
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
          async (value) => {
            const cmd = `obsidian search:context query="${value.replace(/"/g, '\\"')}"`;
            try {
              const result = await this.executeCLI(cmd);
              new ResultModal(this.app, cmd, result).open();
            } catch (error) {
              new obsidian.Notice("❌ 失败: " + error.message);
            }
          },
        ).open();
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        menu.addItem((item) =>
          item
            .setTitle("CLI: 查看文件信息")
            .setIcon("waypoints")
            .onClick(async () => {
              const cmd = `obsidian file path="${file.path}"`;
              try {
                const result = await this.executeCLI(cmd);
                new ResultModal(this.app, cmd, result).open();
              } catch (error) {
                new obsidian.Notice("❌ 失败: " + error.message);
              }
            }),
        );

        menu.addItem((item) =>
          item
            .setTitle("CLI: 查看反向链接")
            .setIcon("links-going-out")
            .onClick(async () => {
              const cmd = `obsidian backlinks path="${file.path}" counts`;
              try {
                const result = await this.executeCLI(cmd);
                new ResultModal(this.app, cmd, result).open();
              } catch (error) {
                new obsidian.Notice("❌ 失败: " + error.message);
              }
            }),
        );

        menu.addItem((item) =>
          item
            .setTitle("CLI: 字数统计")
            .setIcon("file-text")
            .onClick(async () => {
              const cmd = `obsidian wordcount path="${file.path}"`;
              try {
                const result = await this.executeCLI(cmd);
                new ResultModal(this.app, cmd, result).open();
              } catch (error) {
                new obsidian.Notice("❌ 失败: " + error.message);
              }
            }),
        );
      }),
    );

    this.addSettingTab(new CLICommanderSettingTab(this.app, this));
    startScheduler(this);
  }

  async onload() {
    try {
      await this.initializePluginFeatures();
    } catch (error) {
      console.error("[CLI Commander] 插件加载失败", error);
      new obsidian.Notice("CLI Commander 加载失败，请打开开发者控制台查看错误");
    }
  }

  onunload() {
    if (this._schedTimer) {
      clearInterval(this._schedTimer);
      this._schedTimer = null;
    }
  }

  async activateView() {
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

  async executeCLI(cmd, options) {
    return executeCLI.call(this, cmd, options);
  }

  async runWorkflow(workflow) {
    return runWorkflow.call(this, workflow);
  }
}

module.exports = { CLICommanderPlugin, VIEW_TYPE };
