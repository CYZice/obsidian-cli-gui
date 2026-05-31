import { Notice, PluginSettingTab, Setting } from "obsidian";
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
      .setDesc(`当前 ${this.plugin.settings.manualWorkflows.length} 个`)
      .addButton((button) =>
        button
          .setButtonText("清空")
          .setWarning()
          .onClick(async () => {
            this.plugin.settings.manualWorkflows = [];
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    container.createEl("h3", { text: "Workflow 文件源" });

    const sources = this.plugin.settings.workflowSources || [];
    if (sources.length === 0) {
      container.createEl("p", {
        text: "还没有添加文件源。外部工具（如 AI 插件）可以编辑 vault 中的 JSON 文件来管理 workflows。",
        cls: "cli-setting-hint",
      });
    } else {
      sources.forEach((source, index) => {
        const setting = new Setting(container)
          .setName(source.path)
          .setDesc(
            source.lastError
              ? `❌ ${source.lastError}`
              : source.lastLoadedAt
                ? `✅ 已加载 ${new Date(source.lastLoadedAt).toLocaleString()}`
                : "状态未知",
          );

        setting.addToggle((toggle) =>
          toggle.setValue(source.enabled).onChange(async (value) => {
            this.plugin.settings.workflowSources[index].enabled = value;
            await this.plugin.saveSettings();
            this.display();
          }),
        );

        setting.addButton((button) =>
          button.setIcon("refresh-cw").setTooltip("重新加载").onClick(async () => {
            await this.plugin.reloadWorkflowSources();
            this.display();
          }),
        );

        setting.addButton((button) =>
          button.setIcon("trash-2").setTooltip("移除").setWarning().onClick(async () => {
            this.plugin.settings.workflowSources.splice(index, 1);
            await this.plugin.saveSettings();
            this.display();
          }),
        );
      });
    }

    new Setting(container)
      .setName("添加文件源")
      .setDesc("输入 vault 中 JSON 文件的路径")
      .addText((text) =>
        text.setPlaceholder(".cli/workflows.json").onChange(async (value) => {
          if (!value?.trim()) return;
          const path = value.trim();
          const count = await this.plugin.addWorkflowSource(path);
          new Notice(`✅ 已添加文件源，导入了 ${count} 个 workflows`);
          this.display();
        }),
      );

    new Setting(container)
      .setName("重新加载所有文件源")
      .addButton((button) =>
        button.setButtonText("刷新").onClick(async () => {
          await this.plugin.reloadWorkflowSources();
          new Notice("🔄 已重新加载所有文件源");
          this.display();
        }),
      );

    new Setting(container)
      .setName("导出 Workflows 到文件")
      .setDesc("导出手动创建的 workflows 到 vault 文件")
      .addText((text) =>
        text.setPlaceholder(".cli/manual-export.json").onChange(async (value) => {
          if (!value?.trim()) return;
          await this.plugin.exportWorkflowsToFile(value.trim());
          new Notice(`✅ 已导出到 ${value}`);
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
