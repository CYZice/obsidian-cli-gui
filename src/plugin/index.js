const obsidian = require("obsidian");
const { CLI_CATEGORIES } = require("../shared/constants/categories");
const { CLI_COMMANDS } = require("../shared/constants/commands");
const { BUILTIN_PRESETS } = require("../shared/constants/presets");
const { DEFAULT_SETTINGS } = require("../shared/constants/defaults");
const { loadSettings, saveSettings } = require("../infrastructure/persistence/settings");
const { validatePluginIntegrity } = require("../infrastructure/security/integrity");
const { CLICommanderView } = require("../ui/views/CLICommanderView");
const { CLICommanderSettingTab } = require("../ui/setting-tab/CLICommanderSettingTab");
const { QuickInputModal } = require("../ui/components/modals/QuickInputModal");
const { ResultModal } = require("../ui/components/modals/ResultModal");
const { startScheduler } = require("../domain/scheduler");

// Re-export for backwards compatibility
module.exports = {
  CLICommanderPlugin,
  CLICommanderView,
  CLI_CATEGORIES,
  CLI_COMMANDS,
  BUILTIN_PRESETS,
  DEFAULT_SETTINGS,
};

let VIEW_TYPE = "cli-commander-view";

class CLICommanderPlugin extends obsidian.Plugin {
  constructor(app, manifest) {
    super(app, manifest);
    this.isPluginActivated = false;
    this.statusCheckInterval = null;
  }

  get cliCommands() {
    return CLI_COMMANDS;
  }

  async loadSettings() {
    this.settings = await loadSettings(this);
  }

  async saveSettings() {
    await saveSettings(this, this.settings);
  }

  async checkContentProtectionStatus() {
    try {
      var plugin = this.app.plugins.plugins["obsidian-cli-gui"];
      if (plugin) {
        if (!this.app.plugins.enabledPlugins.has("obsidian-cli-gui"))
          return false;
        if (plugin.settings)
          return (
            !!(
              plugin.settings.isActivated === true &&
              plugin.settings.deviceId &&
              plugin.settings.deviceId.trim().length > 0 &&
              plugin.settings.hasBeenActivated === true
            ) && (await this.validateContentProtectionIntegrity())
          );
      }
      return await this.checkContentProtectionFile();
    } catch (e) {
      return false;
    }
  }

  async validateContentProtectionIntegrity() {
    const { compareVersions } = require("../shared/utils/version");
    const { generateSecureHash } = require("../shared/utils/hash");

    try {
      var content = await this.app.vault.adapter.read(
        ".obsidian/plugins/obsidian-cli-gui/manifest.json",
      );
      var manifest = JSON.parse(content);
      var version = manifest.version;
      if (!version) return false;
      if (compareVersions(version, "1.3.0") < 0) return false;
      if (manifest.author !== "CYZice") return false;
      try {
        if (
          !(await validatePluginIntegrity(
            manifest,
            ".obsidian/plugins/obsidian-cli-gui",
          ))
        )
          return false;
        var hash = generateSecureHash(`${manifest.id}:${manifest.author}:` + manifest.version);
        if (!(hash && typeof hash.then === "function" ? await hash : hash)) return false;
      } catch (e) {}
      return true;
    } catch (e) {
      return false;
    }
  }

  async checkContentProtectionFile() {
    try {
      if (!this.app.plugins.enabledPlugins.has("obsidian-cli-gui"))
        return false;
      var content = await this.app.vault.adapter.read(
        ".obsidian/plugins/obsidian-cli-gui/data.json",
      );
      var data = JSON.parse(content);
      return (
        data.isActivated === true &&
        data.deviceId &&
        data.deviceId.trim().length > 0 &&
        data.hasBeenActivated === true &&
        (await this.validateContentProtectionIntegrity())
      );
    } catch (e) {
      return false;
    }
  }

  async checkAndUpdateStatus() {
    var isActive = await this.checkContentProtectionStatus();
    if (!isActive && this.isPluginActivated) {
      this.isPluginActivated = false;
      this.disablePluginFeatures();
    } else if (isActive && !this.isPluginActivated) {
      this.isPluginActivated = true;
      await this.initializePluginFeatures();
    }
  }

  disablePluginFeatures() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }
  }

  showActivationRequired() {
    this.app.plugins.enabledPlugins.has("obsidian-cli-gui");
  }

  async initializePluginFeatures() {
    this.statusCheckInterval = window.setInterval(() => {
      this.checkAndUpdateStatus();
    }, 3e5);

    await this.loadSettings();
    this.registerView(VIEW_TYPE, (leaf) => new CLICommanderView(leaf, this));
    this.addRibbonIcon("waypoints", "CLI Commander", () => this.activateView());

    this.addCommand({
      id: "open-cli-commander",
      name: "打开 CLI Commander",
      callback: () => {
        if (this.isPluginActivated) this.activateView();
      },
    });

    this.addCommand({
      id: "quick-daily-append",
      name: "快速追加到日记",
      callback: () => {
        if (!this.isPluginActivated) return;
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

    this.addCommand({
      id: "quick-search",
      name: "快速搜索",
      callback: () => {
        if (!this.isPluginActivated) return;
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

    this.addSettingTab(new CLICommanderSettingTab(this.app, this));
    startScheduler(this);
  }

  async onload() {
    var isActive = await this.checkContentProtectionStatus();
    if (isActive) {
      this.isPluginActivated = true;
      await this.initializePluginFeatures();
    } else {
      this.isPluginActivated = false;
      this.showActivationRequired();
    }
  }

  onunload() {
    this.disablePluginFeatures();
  }

  activateView() {
    if (this.isPluginActivated) {
      this.app.workspace.getLeaf("tab").then((leaf) =>
        leaf.openViewType(VIEW_TYPE),
      );
    }
  }
}