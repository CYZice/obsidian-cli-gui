const obsidian = require("obsidian");
const { CLICommanderView } = require("../ui/views/CLICommanderView");
const { CLICommanderSettingTab } = require("../ui/setting-tab/CLICommanderSettingTab");
const { QuickInputModal } = require("../ui/components/modals/QuickInputModal");
const { ResultModal } = require("../ui/components/modals/ResultModal");
const { startScheduler } = require("../domain/scheduler");
const { executeCLI } = require("../domain/commands/executor");
const { runWorkflow } = require("./workflowRunner");

const VIEW_TYPE = "cli-commander-view";

class CLICommanderPlugin extends obsidian.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this._schedTimer = null;
    this._schedRan = null;
  }

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

    // 注册视图
    this.registerView(VIEW_TYPE, (leaf) => new CLICommanderView(leaf, this));

    // 添加侧边栏图标
    this.addRibbonIcon("waypoints", "CLI Commander", () => this.activateView());

    // 注册命令：打开主视图
    this.addCommand({
      id: "open-cli-commander",
      name: "打开 CLI Commander",
      callback: () => this.activateView(),
    });

    // 注册命令：快速追加到日记
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
            var cmd = `obsidian daily:append content="${value.replace(/"/g, '\\"')}"`;
            try {
              await this.executeCLI(cmd);
              new obsidian.Notice("✅ 已追加到日记");
            } catch (e) {
              new obsidian.Notice("❌ 失败: " + e.message);
            }
          },
        ).open();
      },
    });

    // 注册命令：快速搜索
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
            var cmd = `obsidian search:context query="${value.replace(/"/g, '\\"')}"`;
            try {
              var result = await this.executeCLI(cmd);
              new ResultModal(this.app, cmd, result).open();
            } catch (e) {
              new obsidian.Notice("❌ 失败: " + e.message);
            }
          },
        ).open();
      },
    });

    // 注册文件菜单项
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        menu.addItem((item) =>
          item
            .setTitle("CLI: 查看文件信息")
            .setIcon("waypoints")
            .onClick(async () => {
              var cmd = `obsidian file path="${file.path}"`;
              try {
                var result = await this.executeCLI(cmd);
                new ResultModal(this.app, cmd, result).open();
              } catch (e) {
                new obsidian.Notice("❌ 失败: " + e.message);
              }
            }),
        );

        menu.addItem((item) =>
          item
            .setTitle("CLI: 查看反向链接")
            .setIcon("links-going-out")
            .onClick(async () => {
              var cmd = `obsidian backlinks path="${file.path}" counts`;
              try {
                var result = await this.executeCLI(cmd);
                new ResultModal(this.app, cmd, result).open();
              } catch (e) {
                new obsidian.Notice("❌ 失败: " + e.message);
              }
            }),
        );

        menu.addItem((item) =>
          item
            .setTitle("CLI: 字数统计")
            .setIcon("file-text")
            .onClick(async () => {
              var cmd = `obsidian wordcount path="${file.path}"`;
              try {
                var result = await this.executeCLI(cmd);
                new ResultModal(this.app, cmd, result).open();
              } catch (e) {
                new obsidian.Notice("❌ 失败: " + e.message);
              }
            }),
        );
      }),
    );

    // 添加设置面板
    this.addSettingTab(new CLICommanderSettingTab(this.app, this));

    // 启动定时调度器
    startScheduler(this);
  }

  async onload() {
    await this.initializePluginFeatures();
  }

  onunload() {
    if (this._schedTimer) {
      clearInterval(this._schedTimer);
      this._schedTimer = null;
    }
  }

  activateView() {
    const leaf = this.app.workspace.getLeaf("tab");
    return leaf.openViewState({
      type: VIEW_TYPE,
      active: true,
    });
  }

  async executeCLI(cmd, options) {
    return executeCLI.call(this, cmd, options);
  }

  async runWorkflow(workflow) {
    return runWorkflow.call(this, workflow);
  }
}

module.exports = { CLICommanderPlugin, VIEW_TYPE };
