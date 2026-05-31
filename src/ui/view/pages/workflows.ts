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

export function renderWorkflows(e) {
    if (this.wfEditor) this._renderWorkflowEditor(e);
    else {
      let p = e.createDiv({ cls: "cli-workflows" });
      var e = p.createDiv({ cls: "cli-section-header" }),
        l =
          (e.createEl("h3", { text: "命令序列", cls: "cli-section-title" }),
          e.createEl("button", {
            cls: "cli-btn-add",
            attr: { title: "导入分享码" },
          })),
        r =
          (setIcon(l, "download"),
          l.createSpan({ text: " 导入" }),
          e.createEl("button", { cls: "cli-btn-add" }));
      (setIcon(r, "plus"),
        r.createSpan({ text: " 新建序列" }),
        this._on(r, "click", () => {
          ((this.wfEditor = { name: "", steps: [], editIdx: null }),
            this.render());
        }));
      let i = p.createDiv({ cls: "cli-preset-import-bar" }),
        s =
          ((i.style.display = "none"),
          i.createEl("input", {
            cls: "cli-preset-import-input",
            attr: {
              type: "text",
              placeholder: "粘贴序列分享码（cli-workflow:...）",
            },
          }));
      var r = i.createEl("button", { cls: "cli-btn-small cli-btn-exec" }),
        n =
          (setIcon(r, "check"),
          r.createSpan({ text: " 确认导入" }),
          i.createEl("button", { cls: "cli-btn-small" }));
      (setIcon(n, "x"),
        this._on(l, "click", () => {
          ((i.style.display = "none" === i.style.display ? "flex" : "none"),
            "none" !== i.style.display && s.focus());
        }),
        this._on(n, "click", () => {
          ((i.style.display = "none"), (s.value = ""));
        }));
      let t = async () => {
          var e = s.value.trim();
          if (e)
            try {
              if (!e.startsWith("cli-workflow:"))
                throw new Error("格式不正确，应以 cli-workflow: 开头");
              var t = decodeURIComponent(
                  escape(atob(e.slice("cli-workflow:".length))),
                ),
                a = JSON.parse(t);
              if (!a.name || !Array.isArray(a.steps))
                throw new Error("数据格式错误");
              (this.plugin.settings.manualWorkflows.push(a),
                await this.plugin.saveSettings(),
                new obsidian.Notice(`已导入序列「${a.name}」`),
                (i.style.display = "none"),
                (s.value = ""),
                this.render());
            } catch (e) {
              new obsidian.Notice("导入失败：" + e.message);
            }
          else new obsidian.Notice("请粘贴分享码");
        },
        d =
          (this._on(r, "click", t),
          this._on(s, "keydown", (e) => {
            ("Enter" === e.key && t(),
              "Escape" === e.key &&
                ((i.style.display = "none"), (s.value = "")));
          }),
          this.plugin.settings.manualWorkflows),
        u = this.plugin.settings.workflowGroups || [];
      l = e.createEl("button", {
        cls: "cli-btn-add cli-btn-new-group",
        attr: { title: "新建分组" },
      });
      if (
        (setIcon(l, "folder-plus"),
        l.createSpan({ text: " 新建组" }),
        this._on(l, "click", () => {
          new QuickInputModal(
            this.app,
            this.plugin,
            "新建序列分组",
            "输入组名...",
            async (e) => {
              e = e.trim();
              e &&
                (u.includes(e)
                  ? new obsidian.Notice("组名已存在")
                  : ((this.plugin.settings.workflowGroups = [...u, e]),
                    await this.plugin.saveSettings(),
                    this.render()));
            },
          ).open();
        }),
        d.length)
      ) {
        let o = (l, s, r, n) => {
          let c = l.createDiv({ cls: "cli-preset-card" });
          var e = c.createDiv({ cls: "cli-preset-card-header" });
          (setIcon(e.createSpan({ cls: "cli-preset-icon" }), "list-ordered"),
            e.createSpan({ cls: "cli-preset-name", text: s.name }),
            e.createSpan({
              cls: "cli-workflow-count",
              text: s.steps.length + " 步",
            }),
            s.schedule &&
              s.schedule.enabled &&
              (setIcon(
                (t = e.createSpan({
                  cls: "cli-wf-schedule-badge",
                  attr: { title: _formatScheduleDesc(s.schedule) },
                })).createSpan({ cls: "cli-wf-schedule-badge-icon" }),
                "clock",
              ),
              t.createSpan({ text: _formatScheduleDesc(s.schedule) })));
          let o = e.createDiv({ cls: "cli-preset-hdr-actions" });
          var t = o.createEl("button", {
              cls: "cli-preset-icon-btn cli-preset-icon-btn-run",
              attr: { title: "运行序列" },
            }),
            e =
              (setIcon(t, "play"),
              this._on(t, "click", (e) => {
                (e.stopPropagation(), this._runWorkflow(s));
              }),
              o.createEl("button", {
                cls: "cli-preset-icon-btn",
                attr: { title: "分享此序列" },
              })),
            t =
              (setIcon(e, "share-2"),
              this._on(e, "click", (e) => {
                e.stopPropagation();
                let t = btoa(unescape(encodeURIComponent(JSON.stringify(s))));
                navigator.clipboard
                  .writeText("cli-workflow:" + t)
                  .then(() => {
                    new obsidian.Notice(
                      "已复制序列分享码，其他用户可点击「导入」粘贴使用",
                    );
                  })
                  .catch(() => {
                    new obsidian.Notice("分享码：cli-workflow:" + t);
                  });
              }),
              o.createEl("button", {
                cls: "cli-preset-icon-btn",
                attr: { title: "编辑序列" },
              }));
          if (
            (setIcon(t, "pencil"),
            this._on(t, "click", (e) => {
              (e.stopPropagation(),
                (this.wfEditor = {
                  name: s.name,
                  steps: JSON.parse(JSON.stringify(s.steps)),
                  schedule: s.schedule
                    ? JSON.parse(JSON.stringify(s.schedule))
                    : null,
                  group: s.group,
                  editIdx: r,
                }),
                this.render());
            }),
            n && 0 < n.length)
          ) {
            let i = o.createEl("button", {
              cls: "cli-preset-icon-btn cli-preset-group-move-btn",
              attr: { title: "移入组" },
            });
            (setIcon(i, "folder-symlink"),
              this._on(i, "click", async (e) => {
                e.stopPropagation();
                var e = i.nextSibling;
                if (
                  e &&
                  e.classList &&
                  e.classList.contains("cli-preset-group-picker")
                )
                  e.remove();
                else {
                  let a = o.createDiv({ cls: "cli-preset-group-picker" });
                  (s.group &&
                    ((e = a.createDiv({
                      cls: "cli-preset-group-picker-item cli-preset-group-picker-remove",
                      text: "✕ 移出组",
                    })),
                    this._on(e, "click", async (e) => {
                      (e.stopPropagation(),
                        delete s.group,
                        await this.plugin.saveSettings(),
                        a.remove(),
                        this.render());
                    })),
                    n.forEach((t) => {
                      var e;
                      t !== s.group &&
                        ((e = a.createDiv({
                          cls: "cli-preset-group-picker-item",
                          text: t,
                        })),
                        this._on(e, "click", async (e) => {
                          (e.stopPropagation(),
                            (s.group = t),
                            await this.plugin.saveSettings(),
                            a.remove(),
                            this.render());
                        }));
                    }));
                  let t = (e) => {
                    a.contains(e.target) ||
                      e.target === i ||
                      (a.remove(), document.removeEventListener("click", t));
                  };
                  setTimeout(() => document.addEventListener("click", t), 0);
                }
              }));
          }
          let a = o.createEl("button", {
              cls: "cli-preset-icon-btn cli-preset-icon-btn-danger",
              attr: { title: "删除序列" },
            }),
            i =
              (setIcon(a, "trash-2"),
              this._on(a, "click", (e) => {
                (e.stopPropagation(),
                  this._confirmDanger(a, async () => {
                    (this.plugin.settings.manualWorkflows.splice(r, 1),
                      await this.plugin.saveSettings(),
                      this.render());
                  }));
              }),
              setIcon(
                o.createEl("button", {
                  cls: "cli-preset-icon-btn cli-preset-drag-handle",
                  attr: { title: "拖拽排序", draggable: "false" },
                }),
                "grip-vertical",
              ),
              c.setAttribute("draggable", "true"),
              (c.dataset.wfIdx = String(r)),
              this._on(c, "dragstart", (e) => {
                ((e.dataTransfer.effectAllowed = "move"),
                  e.dataTransfer.setData("text/plain", String(r)),
                  setTimeout(() => c.addClass("cli-preset-dragging"), 0));
              }),
              this._on(c, "dragend", () => {
                (c.removeClass("cli-preset-dragging"),
                  CLICommanderView._hideDragLine());
              }),
              this._on(c, "dragover", (e) => {
                (e.preventDefault(), (e.dataTransfer.dropEffect = "move"));
                var t = c.getBoundingClientRect(),
                  e = e.clientY > t.top + t.height / 2;
                ((c.dataset.dropAfter = e ? "1" : "0"),
                  CLICommanderView._showDragLine(c, e));
              }),
              this._on(c, "dragleave", (e) => {
                c.contains(e.relatedTarget) || CLICommanderView._hideDragLine();
              }),
              this._on(c, "drop", async (t) => {
                (t.preventDefault(), CLICommanderView._hideDragLine());
                let a = parseInt(t.dataTransfer.getData("text/plain"));
                t = "1" === c.dataset.dropAfter;
                if (a !== r) {
                  var i = Array.from(
                    l.querySelectorAll(".cli-preset-card[data-wf-idx]"),
                  ).find((e) => e.dataset.wfIdx === String(a));
                  if (i && i !== c) {
                    t
                      ? c.insertAdjacentElement("afterend", i)
                      : l.insertBefore(i, c);
                    var i = this.plugin.settings.manualWorkflows,
                      [s] = i.splice(a, 1);
                    let e = r;
                    (a < r && (e = r - 1),
                      t && (e += 1),
                      i.splice(e, 0, s),
                      await this.plugin.saveSettings());
                  }
                }
              }),
              c.createDiv({ cls: "cli-workflow-steps" }));
          return (
            s.steps.forEach((e, t) => {
              var a = i.createDiv({ cls: "cli-workflow-step" });
              (a.createSpan({
                cls: "cli-workflow-step-num",
                text: "" + (t + 1),
              }),
                a.createSpan({
                  cls: "cli-workflow-step-cmd",
                  text: e.label || e.command,
                }),
                0 < e.sleep &&
                  a.createSpan({
                    cls: "cli-workflow-step-sleep",
                    text: `+${e.sleep}ms`,
                  }));
            }),
            c
          );
        };
        u.forEach((i) => {
          var e = d.filter((e) => e.group === i),
            t = p.createDiv({ cls: "cli-preset-group" }),
            a = t.createDiv({ cls: "cli-preset-group-hdr" }),
            s = !!(this.plugin.settings.wfGroupCollapsed || {})[i];
          let l = a.createSpan({ cls: "cli-preset-group-arrow" }),
            r =
              (setIcon(l, s ? "chevron-right" : "chevron-down"),
              setIcon(a.createSpan({ cls: "cli-preset-group-icon" }), "folder"),
              a.createSpan({ cls: "cli-preset-group-name", text: i })),
            n =
              (a.createSpan({
                cls: "cli-preset-group-count",
                text: `(${e.length})`,
              }),
              this._on(r, "dblclick", (e) => {
                e.stopPropagation();
                let a = document.createElement("input");
                ((a.className = "cli-preset-group-name-input"),
                  (a.value = i),
                  r.replaceWith(a),
                  a.focus(),
                  a.select());
                (a.addEventListener("blur", async () => {
                  let t = a.value.trim();
                  var e;
                  t && t !== i
                    ? u.includes(t)
                      ? (new obsidian.Notice("组名已存在"), a.replaceWith(r))
                      : (-1 !==
                          (e =
                            this.plugin.settings.workflowGroups.indexOf(i)) &&
                          (this.plugin.settings.workflowGroups[e] = t),
                        d.forEach((e) => {
                          e.group === i && (e.group = t);
                        }),
                        await this.plugin.saveSettings(),
                        this.render())
                    : a.replaceWith(r);
                }),
                  a.addEventListener("keydown", (e) => {
                    "Enter" === e.key
                      ? a.blur()
                      : "Escape" === e.key && a.replaceWith(r);
                  }));
              }),
              a.createEl("button", {
                cls: "cli-preset-icon-btn cli-preset-icon-btn-danger cli-preset-group-del",
                attr: { title: "删除此组" },
              })),
            c =
              (setIcon(n, "folder-minus"),
              this._on(n, "click", async (e) => {
                (e.stopPropagation(),
                  this._confirmDanger(n, async () => {
                    (d.forEach((e) => {
                      e.group === i && delete e.group;
                    }),
                      (this.plugin.settings.workflowGroups = u.filter(
                        (e) => e !== i,
                      )),
                      await this.plugin.saveSettings(),
                      this.render());
                  }));
              }),
              t.createDiv({ cls: "cli-preset-group-body cli-preset-grid" }));
          (s && (c.style.display = "none"),
            this._on(a, "click", async (e) => {
              e.target.closest("button") ||
                "INPUT" === e.target.tagName ||
                (((e = this.plugin.settings.wfGroupCollapsed || {})[i] = !e[i]),
                (this.plugin.settings.wfGroupCollapsed = e),
                await this.plugin.saveSettings(),
                (e = e[i]),
                (c.style.display = e ? "none" : ""),
                l.empty(),
                setIcon(l, e ? "chevron-right" : "chevron-down"));
            }),
            0 === e.length
              ? c.createDiv({ cls: "cli-empty", text: "此组暂无序列" })
              : e.forEach((e) => {
                  var t = d.indexOf(e);
                  o(c, e, t, u);
                }));
        });
        n = d.filter((e) => !e.group || !u.includes(e.group));
        if (0 < n.length) {
          r = p.createDiv({
            cls: "cli-preset-group cli-preset-group-ungrouped",
          });
          if (0 < u.length) {
            e = r.createDiv({ cls: "cli-preset-group-hdr" });
            let t = e.createSpan({ cls: "cli-preset-group-arrow" });
            l = !!(this.plugin.settings.wfGroupCollapsed || {}).__ungrouped__;
            (setIcon(t, l ? "chevron-right" : "chevron-down"),
              setIcon(
                e.createSpan({ cls: "cli-preset-group-icon" }),
                "folder-open",
              ),
              e.createSpan({ cls: "cli-preset-group-name", text: "未分组" }),
              e.createSpan({
                cls: "cli-preset-group-count",
                text: `(${n.length})`,
              }));
            let a = r.createDiv({
              cls: "cli-preset-group-body cli-preset-grid",
            });
            (l && (a.style.display = "none"),
              this._on(e, "click", async () => {
                var e = this.plugin.settings.wfGroupCollapsed || {},
                  e =
                    ((e.__ungrouped__ = !e.__ungrouped__),
                    (this.plugin.settings.wfGroupCollapsed = e),
                    await this.plugin.saveSettings(),
                    e.__ungrouped__);
                ((a.style.display = e ? "none" : ""),
                  t.empty(),
                  setIcon(t, e ? "chevron-right" : "chevron-down"));
              }),
              n.forEach((e) => {
                var t = d.indexOf(e);
                o(a, e, t, u);
              }));
          } else {
            let a = r.createDiv({ cls: "cli-preset-grid" });
            n.forEach((e) => {
              var t = d.indexOf(e);
              o(a, e, t, u);
            });
          }
        }
      } else
        p.createDiv({
          cls: "cli-empty",
          text: "还没有命令序列\n命令序列可以按顺序执行多个 CLI 命令",
        });
    }
  }

export function formatScheduleDesc(e) {
    return _formatScheduleDesc(e);
  }

export function renderWorkflowEditor(e) {
    let g = this.wfEditor,
      t = null !== g.editIdx;
    var e = e.createDiv({ cls: "cli-wf-editor" }),
      a = e.createDiv({ cls: "cli-wf-editor-topbar" }),
      i = a.createEl("button", { cls: "cli-back-btn" }),
      i =
        (setIcon(i, "arrow-left"),
        i.createSpan({ text: " 返回" }),
        this._on(i, "click", () => {
          ((this.wfEditor = null), this.render());
        }),
        a.createEl("h3", {
          cls: "cli-wf-editor-title",
          text: t ? "编辑序列" : "新建序列",
        }),
        e.createDiv({ cls: "cli-wf-name-row" }));
    i.createSpan({ cls: "cli-wf-name-label", text: "序列名称" });
    let s = i.createEl("input", {
      cls: "cli-param-input cli-wf-name-input",
      attr: { type: "text", placeholder: "如：早晨工作流", value: g.name },
    });
    this._on(s, "input", () => {
      g.name = s.value;
    });
    a = e.createDiv({ cls: "cli-wf-hint" });
    (setIcon(a.createSpan({ cls: "cli-wf-hint-icon" }), "info"),
      a.createSpan({
        text: " 每个步骤可勾选「使用上一步结果」，将上一步的输出自动传递给下一条命令；也可勾选「批量模式」，对上一步每行结果分别执行。⚠️注意：需清楚 {prev} 和 {file}占位符的使用方法，否则即使勾选也不起作用或报错。具体可查看CLI Commander插件说明文档",
      }));
    let v = e.createDiv({ cls: "cli-wf-steps-editor" }),
      f = () => {
        (v.empty(),
          g.steps.forEach((i, t) => {
            var a = v.createDiv({ cls: "cli-wf-step-card" });
            let s = a.createDiv({ cls: "cli-wf-step-hdr" });
            (s
              .createDiv({ cls: "cli-wf-step-badge" })
              .createSpan({ text: String(t + 1) }),
              s.createSpan({
                cls: "cli-wf-step-hdr-label",
                text: i.label || "未设置命令",
              }),
              i.isEval &&
                (setIcon(
                  (n = s.createSpan({ cls: "cli-wf-eval-badge" })).createSpan(),
                  "code-2",
                ),
                n.createSpan({ text: " 脚本" })));
            let l, r;
            0 < t &&
              (setIcon(
                (l = s.createSpan({
                  cls: "cli-wf-prev-badge " + (i.usePrev ? "" : "is-hidden"),
                })).createSpan(),
                "arrow-up",
              ),
              l.createSpan({ text: " 含上步结果" }),
              setIcon(
                (r = s.createSpan({
                  cls: "cli-wf-batch-badge " + (i.batchMode ? "" : "is-hidden"),
                })).createSpan(),
                "layers",
              ),
              r.createSpan({ text: " 批量" }));
            var n = s.createDiv({ cls: "cli-wf-step-hdr-actions" }),
              c =
                (0 < t &&
                  (setIcon(
                    (c = n.createEl("button", {
                      cls: "cli-preset-icon-btn",
                      attr: { title: "上移" },
                    })),
                    "chevron-up",
                  ),
                  this._on(c, "click", () => {
                    var e = g.steps.splice(t, 1)[0];
                    (g.steps.splice(t - 1, 0, e), f());
                  })),
                t < g.steps.length - 1 &&
                  (setIcon(
                    (c = n.createEl("button", {
                      cls: "cli-preset-icon-btn",
                      attr: { title: "下移" },
                    })),
                    "chevron-down",
                  ),
                  this._on(c, "click", () => {
                    var e = g.steps.splice(t, 1)[0];
                    (g.steps.splice(t + 1, 0, e), f());
                  })),
                n.createEl("button", {
                  cls: "cli-preset-icon-btn cli-preset-icon-btn-danger",
                  attr: { title: "删除步骤" },
                })),
              n =
                (setIcon(c, "trash-2"),
                this._on(c, "click", () => {
                  (g.steps.splice(t, 1), f());
                }),
                a.createDiv({ cls: "cli-wf-step-body" })),
              c = n.createDiv({ cls: "cli-wf-field-row" }),
              a =
                (c.createSpan({ cls: "cli-wf-field-label", text: "命令" }),
                c.createDiv({ cls: "cli-wf-cmd-wrap" }));
            let o = a.createEl("input", {
                cls: "cli-param-input cli-wf-cmd-input",
                attr: {
                  type: "text",
                  placeholder: "输入命令或从下方搜索选择...",
                  value: i.command,
                },
              }),
              p =
                (this._on(o, "input", () => {
                  ((i.command = o.value),
                    i.usePrev || (i.label = o.value),
                    (s.querySelector(".cli-wf-step-hdr-label").textContent =
                      i.label || "未设置命令"),
                    e(o.value));
                }),
                this._on(o, "focus", () => {
                  ((p.style.display = "block"), e(o.value));
                }),
                this._on(o, "blur", () => {
                  setTimeout(() => {
                    p.style.display = "none";
                  }, 150);
                }),
                a.createDiv({ cls: "cli-wf-cmd-dropdown" }));
            p.style.display = "none";
            let d = (() => {
                let a = [];
                return (
                  CLI_COMMANDS.forEach((e) =>
                    a.push({
                      label: e.name,
                      sub: e.id,
                      command: "obsidian " + e.id,
                      type: "cmd",
                    }),
                  ),
                  BUILTIN_PRESETS.forEach((t) => {
                    var e = CLI_COMMANDS.find((e) => e.id === t.commandId);
                    e &&
                      ((e = buildCommandString(e, t.defaultParams || {})),
                      a.push({
                        label: t.name,
                        sub: e,
                        command: e,
                        type: "preset",
                      }));
                  }),
                  (this.plugin.settings.userPresets || []).forEach((e) => {
                    a.push({
                      label: e.name,
                      sub: e.command,
                      command: e.command,
                      type: "user",
                    });
                  }),
                  (this.plugin.settings.evalSnippets || []).forEach((e) => {
                    var t =
                      e.code
                        .split("\n")
                        .find((e) => e.trim() && !e.trim().startsWith("//")) ||
                      e.code.slice(0, 50);
                    a.push({
                      label: e.name,
                      sub: t,
                      command: e.code,
                      type: "eval",
                      isEval: !0,
                    });
                  }),
                  a
                );
              })(),
              e = (e) => {
                p.empty();
                let t = e.toLowerCase().trim();
                e = (
                  t
                    ? d.filter(
                        (e) =>
                          e.label.toLowerCase().includes(t) ||
                          e.sub.toLowerCase().includes(t),
                      )
                    : d
                ).slice(0, 20);
                e.length
                  ? e.forEach((t) => {
                      var e = p.createDiv({ cls: "cli-wf-dd-item" }),
                        a =
                          "cmd" === t.type
                            ? "命令"
                            : "preset" === t.type
                              ? "内置"
                              : "eval" === t.type
                                ? "脚本"
                                : "用户",
                        a =
                          (e.createSpan({
                            cls: "cli-wf-dd-type cli-wf-dd-type-" + t.type,
                            text: a,
                          }),
                          e.createDiv({ cls: "cli-wf-dd-info" }));
                      (a.createDiv({ cls: "cli-wf-dd-label", text: t.label }),
                        a.createDiv({ cls: "cli-wf-dd-sub", text: t.sub }),
                        this._on(e, "mousedown", (e) => {
                          (e.preventDefault(),
                            t.isEval
                              ? ((i.isEval = !0),
                                (i.command = t.command),
                                (i.baseCommand = t.command),
                                (i.label = t.label),
                                (o.value = "[脚本] " + t.label),
                                (s.querySelector(
                                  ".cli-wf-step-hdr-label",
                                ).textContent = t.label),
                                s.querySelector(".cli-wf-eval-badge") ||
                                  (setIcon(
                                    (e = s.createSpan({
                                      cls: "cli-wf-eval-badge",
                                    })).createSpan(),
                                    "code-2",
                                  ),
                                  e.createSpan({ text: " 脚本" })))
                              : ((i.isEval = !1),
                                (e = t.command),
                                (i.baseCommand = e),
                                (i.label = t.label),
                                i.usePrev
                                  ? /content="[^"]*"/.test(e)
                                    ? (i.command = e.replace(
                                        /(content="[^"]*)(")/,
                                        "$1{prev}$2",
                                      ))
                                    : (i.command = e + ' content="{prev}"')
                                  : (i.command = e),
                                (o.value = i.command),
                                (s.querySelector(
                                  ".cli-wf-step-hdr-label",
                                ).textContent = t.label),
                                (e = s.querySelector(".cli-wf-eval-badge")) &&
                                  e.remove()),
                            (p.style.display = "none"));
                        }));
                    })
                  : p.createDiv({ cls: "cli-wf-dd-empty", text: "无匹配" });
              };
            e("");
            c = n.createDiv({ cls: "cli-wf-field-row" });
            c.createSpan({ cls: "cli-wf-field-label", text: "执行后等待" });
            let u = c.createEl("input", {
                cls: "cli-param-input cli-wf-sleep-input",
                attr: {
                  type: "number",
                  min: "0",
                  placeholder: "0",
                  value: 0 < i.sleep ? String(i.sleep) : "",
                },
              }),
              m =
                (c.createSpan({ cls: "cli-wf-field-unit", text: "毫秒" }),
                this._on(u, "input", () => {
                  i.sleep = parseInt(u.value) || 0;
                }),
                () => {
                  let e = i.baseCommand || i.command;
                  return (
                    i.usePrev &&
                      (/content="[^"]*"/.test(e)
                        ? (e = e.replace(/(content="[^"]*)(")/, "$1{prev}$2"))
                        : (e += ' content="{prev}"')),
                    i.batchMode &&
                      (e.includes("path=")
                        ? (e = e.replace(
                            /path=[^\s"]+|path="[^"]*"/,
                            'path="{file}"',
                          ))
                        : (e += ' path="{file}"')),
                    e
                  );
                });
            if (0 < t) {
              a = n
                .createDiv({ cls: "cli-wf-field-row cli-wf-prev-row" })
                .createEl("label", { cls: "cli-wf-prev-label" });
              let e = a.createEl("input", { attr: { type: "checkbox" } });
              ((e.checked = !!i.usePrev),
                a.createSpan({
                  text: " 使用上一步结果：将上一步的输出结果传入此命令",
                }),
                this._on(e, "change", () => {
                  ((i.usePrev = e.checked),
                    i.baseCommand ||
                      (i.baseCommand = i.command
                        .replace(/\s*content="\{prev\}"/g, "")
                        .replace(/\{prev\}/g, "")
                        .replace(/\{上一步结果\}/g, "")
                        .trim()),
                    (i.command = m()),
                    (o.value = i.command),
                    i.usePrev
                      ? l.removeClass("is-hidden")
                      : l.addClass("is-hidden"));
                }));
            }
            if (0 < t) {
              c = n
                .createDiv({ cls: "cli-wf-field-row cli-wf-prev-row" })
                .createEl("label", { cls: "cli-wf-prev-label" });
              let e = c.createEl("input", { attr: { type: "checkbox" } });
              ((e.checked = !!i.batchMode),
                c.createSpan({ text: " 批量模式：对上一步每行结果分别执行" }),
                this._on(e, "change", () => {
                  ((i.batchMode = e.checked),
                    i.baseCommand ||
                      (i.baseCommand = i.command
                        .replace(/\s*path="\{file\}"/g, "")
                        .replace(/\{file\}/g, "")
                        .trim()),
                    (i.command = m()),
                    (o.value = i.command),
                    i.batchMode
                      ? r.removeClass("is-hidden")
                      : r.addClass("is-hidden"));
                }));
            }
            a = n.createDiv({ cls: "cli-wf-field-row" });
            a.createSpan({ cls: "cli-wf-field-label", text: "失败后继续" });
            let h = a.createEl("input", { attr: { type: "checkbox" } });
            ((h.checked = !!i.continueOnError),
              this._on(h, "change", () => {
                i.continueOnError = h.checked;
              }),
              t < g.steps.length - 1 &&
                setIcon(
                  v
                    .createDiv({ cls: "cli-wf-connector" })
                    .createDiv({ cls: "cli-wf-connector-line" }),
                  "arrow-down",
                ));
          }));
        var e = v.createEl("button", { cls: "cli-wf-add-step-btn" });
        (setIcon(e, "plus-circle"),
          e.createSpan({ text: " 添加步骤" }),
          this._on(e, "click", () => {
            (g.steps.push({
              command: "",
              label: "",
              sleep: 0,
              continueOnError: !1,
            }),
              f());
          }));
      };
    f();
    ((i = e.createDiv({ cls: "cli-wf-schedule-wrap" })),
      (a = i.createDiv({ cls: "cli-wf-schedule-hdr" })));
    let l = a.createSpan({ cls: "cli-wf-schedule-arrow" }),
      r =
        (setIcon(l, "chevron-right"),
        setIcon(a.createSpan({ cls: "cli-wf-schedule-title-icon" }), "clock"),
        a.createSpan({ cls: "cli-wf-schedule-title", text: "定时触发" }),
        a.createSpan({ cls: "cli-wf-schedule-status" })),
      n = g.schedule || {
        enabled: !1,
        type: "daily",
        time: "08:00",
        weekday: 1,
        intervalMin: 60,
      },
      c =
        (g.schedule || (g.schedule = n),
        () => {
          (r.empty(),
            n.enabled
              ? (r.addClass("is-on"),
                r.removeClass("is-off"),
                (r.textContent = _formatScheduleDesc(n)))
              : (r.addClass("is-off"),
                r.removeClass("is-on"),
                (r.textContent = "未开启")));
        }),
      o = (c(), i.createDiv({ cls: "cli-wf-schedule-body" })),
      p = !(o.style.display = "none");
    this._on(a, "click", () => {
      ((p = !p),
        (o.style.display = p ? "" : "none"),
        l.empty(),
        setIcon(l, p ? "chevron-down" : "chevron-right"));
    });
    i = o
      .createDiv({ cls: "cli-wf-schedule-row" })
      .createEl("label", { cls: "cli-wf-schedule-label" });
    let d = i.createEl("input", { attr: { type: "checkbox" } });
    ((d.checked = n.enabled), i.createSpan({ text: " 启用定时执行" }));
    a = o.createDiv({ cls: "cli-wf-schedule-row" });
    a.createSpan({ cls: "cli-wf-schedule-field-label", text: "触发方式" });
    let u = a.createEl("select", { cls: "cli-wf-schedule-select" }),
      m =
        ([
          ["daily", "每天指定时间"],
          ["weekly", "每周指定时间"],
          ["interval", "每隔 N 分钟"],
        ].forEach(([e, t]) => {
          t = u.createEl("option", { value: e, text: t });
          n.type === e && (t.selected = !0);
        }),
        o.createDiv({ cls: "cli-wf-schedule-row cli-wf-schedule-time-row" })),
      h =
        (m.createSpan({ cls: "cli-wf-schedule-field-label", text: "执行时间" }),
        m.createEl("input", {
          cls: "cli-wf-schedule-input",
          attr: { type: "time", value: n.time || "08:00" },
        })),
      b = o.createDiv({ cls: "cli-wf-schedule-row cli-wf-schedule-week-row" }),
      y =
        (b.createSpan({ cls: "cli-wf-schedule-field-label", text: "星期几" }),
        b.createEl("select", { cls: "cli-wf-schedule-select" })),
      w =
        (["日", "一", "二", "三", "四", "五", "六"].forEach((e, t) => {
          e = y.createEl("option", { value: String(t), text: "星期" + e });
          n.weekday === t && (e.selected = !0);
        }),
        o.createDiv({
          cls: "cli-wf-schedule-row cli-wf-schedule-interval-row",
        })),
      x =
        (w.createSpan({
          cls: "cli-wf-schedule-field-label",
          text: "间隔分钟数",
        }),
        w.createEl("input", {
          cls: "cli-wf-schedule-input",
          attr: {
            type: "number",
            min: "1",
            max: "1440",
            value: String(n.intervalMin || 60),
          },
        })),
      _ =
        (w.createSpan({ cls: "cli-wf-schedule-unit", text: "分钟" }),
        () => {
          var e = u.value;
          ((m.style.display = "daily" === e || "weekly" === e ? "" : "none"),
            (b.style.display = "weekly" === e ? "" : "none"),
            (w.style.display = "interval" === e ? "" : "none"));
        });
    (_(),
      this._on(u, "change", () => {
        ((n.type = u.value), _(), c());
      }),
      this._on(h, "change", () => {
        ((n.time = h.value), c());
      }),
      this._on(y, "change", () => {
        ((n.weekday = parseInt(y.value)), c());
      }),
      this._on(x, "input", () => {
        ((n.intervalMin = parseInt(x.value) || 60), c());
      }),
      this._on(d, "change", () => {
        ((n.enabled = d.checked), c());
      }));
    ((i = e.createDiv({ cls: "cli-wf-editor-footer" })),
      (a = i.createEl("button", { cls: "cli-btn-small" })),
      setIcon(a, "x"),
      a.createSpan({ text: " 取消" }),
      this._on(a, "click", () => {
        ((this.wfEditor = null), this.render());
      }),
      (e = i.createEl("button", { cls: "cli-btn-small cli-btn-exec" })));
    (setIcon(e, "save"),
      e.createSpan({ text: " 保存序列" }),
      this._on(e, "click", async () => {
        var e;
        g.name.trim()
          ? g.steps.length
            ? g.steps.some((e) => !e.command.trim())
              ? new obsidian.Notice("有步骤未填写命令")
              : ((e = {
                  name: g.name.trim(),
                  steps: g.steps,
                  schedule: g.schedule || null,
                }),
                void 0 !== g.group && (e.group = g.group),
                t
                  ? (this.plugin.settings.manualWorkflows[g.editIdx] = e)
                  : this.plugin.settings.manualWorkflows.push(e),
                await this.plugin.saveSettings(),
                (this.wfEditor = null),
                this.render())
            : new obsidian.Notice("请至少添加一个步骤")
          : new obsidian.Notice("请输入序列名称");
      }));
  }
