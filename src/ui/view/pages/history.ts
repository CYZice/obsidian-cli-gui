// @ts-nocheck
const obsidian = require("obsidian");
const { CLI_CATEGORIES } = require("../../../shared/constants/categories");
const { CLI_COMMANDS } = require("../../../shared/constants/commands");
const { BUILTIN_PRESETS } = require("../../../shared/constants/presets");
const { buildCommandString, formatScheduleDesc: builderFormatScheduleDesc } = require("../../../domain/commands/builder");
const { formatTime } = require("../../components/common/datetime");
const { getCategoryIcon, setIcon } = require("../../components/common/icon");
const { ConfirmModal } = require("../../components/modals/ConfirmModal");
const { QuickInputModal } = require("../../components/modals/QuickInputModal");
const { SavePresetModal } = require("../../components/modals/SavePresetModal");

const _formatScheduleDesc = builderFormatScheduleDesc;

export function renderHistory(e) {
    let i = e.createDiv({ cls: "cli-history" });
    e = i.createDiv({ cls: "cli-section-header" });
    if (
      (e.createEl("h3", { text: "执行历史", cls: "cli-section-title" }),
      this.plugin.settings.executionHistory.length)
    ) {
      let t = e.createEl("button", {
        cls: "cli-btn-small cli-btn-danger-small",
      });
      (setIcon(t, "brush-cleaning"),
        t.createSpan({ text: " 清空" }),
        this._on(t, "click", (e) => {
          (e.stopPropagation(),
            this._confirmDanger(t, async () => {
              ((this.plugin.settings.executionHistory = []),
                await this.plugin.saveSettings(),
                this.render());
            }));
        }));
    }
    this.plugin.settings.executionHistory.length
      ? this.plugin.settings.executionHistory.forEach((t) => {
          var e = i.createDiv({
              cls: "cli-history-item " + (t.success ? "" : "is-error"),
            }),
            a = e.createDiv({ cls: "cli-history-item-header" }),
            a =
              (setIcon(
                a.createSpan({ cls: "cli-history-status" }),
                t.success ? "check-circle" : "x-circle",
              ),
              a.createSpan({
                cls: "cli-history-name",
                text: t.commandName || t.commandId,
              }),
              a.createSpan({
                cls: "cli-history-time",
                text: formatTime(t.timestamp),
              }),
              e.createDiv({ cls: "cli-history-cmd", text: t.command }),
              t.result &&
                e.createDiv({
                  cls: "cli-history-result-preview",
                  text:
                    100 < t.result.length
                      ? t.result.substring(0, 100) + "..."
                      : t.result,
                }),
              e.createDiv({ cls: "cli-history-actions" })),
            e = a.createEl("button", { cls: "cli-btn-small" }),
            e =
              (setIcon(e, "rotate-ccw"),
              e.createSpan({ text: " 重新执行" }),
              this._on(e, "click", async () => {
                if (t.workflow) await this._runWorkflow(t.workflow);
                else
                  try {
                    var e = await this.plugin.executeCLI(t.command);
                    this._showResult(e, !1);
                  } catch (e) {
                    this._showResult(e.message, !0);
                  }
              }),
              a.createEl("button", { cls: "cli-btn-small" }));
          (setIcon(e, "clipboard"),
            e.createSpan({ text: " 复制" }),
            this._on(e, "click", () => {
              (navigator.clipboard.writeText(t.command),
                new obsidian.Notice("已复制命令"));
            }));
        })
      : i.createDiv({ cls: "cli-empty", text: "还没有执行记录" });
  }
