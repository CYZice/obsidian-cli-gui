import { PluginSettingTab, Setting } from "obsidian";
import { BUILTIN_PRESETS } from "../../shared/constants/presets";
import type { CLICommanderPluginInstance } from "../../types";

export class CLICommanderSettingTab extends PluginSettingTab {
  plugin: CLICommanderPluginInstance;

  constructor(app: CLICommanderPluginInstance["app"], plugin: CLICommanderPluginInstance) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const container = this.containerEl;
    container.empty();
    container.createEl("h2", { text: "CLI Commander 设置" });

    new Setting(container)
      .setName("显示命令预览")
      .setDesc("在构建器中显示生成的CLI命令")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showCommandPreview).onChange(async (value) => {
          this.plugin.settings.showCommandPreview = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(container)
      .setName("执行后显示结果面板")
      .setDesc("执行命令后在底部显示结果面板，关闭后仍可通过 Notice 查看简短提示")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.showResultPanel ?? true).onChange(async (value) => {
          this.plugin.settings.showResultPanel = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(container)
      .setName("危险操作确认")
      .setDesc("执行删除等操作前弹出确认")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.confirmDangerous).onChange(async (value) => {
          this.plugin.settings.confirmDangerous = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(container)
      .setName("历史记录上限")
      .setDesc("保存的执行历史最大条数")
      .addText((text) =>
        text.setValue(String(this.plugin.settings.maxHistory)).onChange(async (value) => {
          const parsed = parseInt(value, 10);
          if (!Number.isNaN(parsed) && parsed > 0) {
            this.plugin.settings.maxHistory = parsed;
            await this.plugin.saveSettings();
          }
        }),
      );

    container.createEl("h3", { text: "文件移动" });

    new Setting(container)
      .setName("同名文件自动重命名")
      .setDesc("执行 move 命令时，若目标路径已存在同名文件，自动在文件名后追加后缀而不是跳过")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.moveConflictRename ?? true).onChange(async (value) => {
          this.plugin.settings.moveConflictRename = value;
          await this.plugin.saveSettings();
          this.display();
        }),
      );

    if (this.plugin.settings.moveConflictRename) {
      new Setting(container)
        .setName("后缀方式")
        .setDesc("同名冲突时追加的后缀类型")
        .addDropdown((dropdown) =>
          dropdown
            .addOption("number", "数字后缀（file_1、file_2…）")
            .addOption("timestamp", "时间戳后缀（file_2024-01-01_12-00-00）")
            .setValue(this.plugin.settings.moveConflictSuffix || "number")
            .onChange(async (value) => {
              this.plugin.settings.moveConflictSuffix = value as "number" | "timestamp";
              await this.plugin.saveSettings();
            }),
        );
    }

    container.createEl("h3", { text: "数据管理" });

    new Setting(container)
      .setName("清空执行历史")
      .setDesc(`当前 ${this.plugin.settings.executionHistory.length} 条`)
      .addButton((button) =>
        button
          .setButtonText("清空")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.executionHistory = [];
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    new Setting(container)
      .setName("清空用户预设")
      .setDesc(`当前 ${this.plugin.settings.userPresets.length} 个`)
      .addButton((button) =>
        button
          .setButtonText("清空")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.userPresets = [];
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    new Setting(container)
      .setName("清空命令序列")
      .setDesc(`当前 ${this.plugin.settings.workflows.length} 个`)
      .addButton((button) =>
        button
          .setButtonText("清空")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.workflows = [];
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    container.createEl("h3", { text: "内置预设管理" });

    const hiddenPresets = this.plugin.settings.hiddenBuiltinPresets || [];
    if (hiddenPresets.length === 0) {
      container.createEl("p", {
        text: "没有隐藏的内置预设",
        cls: "cli-setting-hint",
      });
      return;
    }

    hiddenPresets.forEach((presetId) => {
      const preset = BUILTIN_PRESETS.find((item) => item.id === presetId);
      if (!preset) {
        return;
      }

      new Setting(container)
        .setName(preset.name)
        .setDesc(preset.desc || "")
        .addButton((button) =>
          button.setButtonText("恢复").onClick(async () => {
            this.plugin.settings.hiddenBuiltinPresets = (
              this.plugin.settings.hiddenBuiltinPresets || []
            ).filter((id) => id !== presetId);
            await this.plugin.saveSettings();
            this.display();
          }),
        );
    });

    new Setting(container)
      .setName("恢复全部隐藏预设")
      .addButton((button) =>
        button
          .setButtonText("全部恢复")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.hiddenBuiltinPresets = [];
            await this.plugin.saveSettings();
            this.display();
          }),
      );
  }
}
