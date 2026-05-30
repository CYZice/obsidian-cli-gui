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

export function renderPresets(e) {
    var e = e.createDiv({ cls: "cli-presets" }),
      t = e
        .createDiv({ cls: "cli-search-wrap" })
        .createDiv({ cls: "cli-search-inner" });
    setIcon(t.createSpan({ cls: "cli-search-icon" }), "search");
    let a = t.createEl("input", {
        cls: "cli-search-input",
        attr: { type: "text", placeholder: "搜索预设..." },
      }),
      i =
        ((a.value = this.presetSearchQ),
        this._on(a, "input", () => {
          ((this.presetSearchQ = a.value), this._refreshPresetList(i));
        }),
        e.createDiv({ cls: "cli-presets-body" }));
    this._renderPresetsBody(i);
  }

export function refreshPresetList(e) {
    (e.empty(), this._renderPresetsBody(e));
  }

export function renderPresetsBody(e) {
    let t = this.presetSearchQ.toLowerCase().trim();
    var i = e.createDiv({ cls: "cli-section" });
    i.createEl("h3", { text: "内置预设", cls: "cli-section-title" });
    let a = i.createDiv({ cls: "cli-preset-grid" }),
      s = this.plugin.settings.hiddenBuiltinPresets || [],
      l = this.plugin.settings.builtinPresetOrder || [];
    var r = BUILTIN_PRESETS.filter((e) => !s.includes(e.id));
    let n = l.length
        ? [...r].sort((e, t) => {
            ((e = l.indexOf(e.id)), (t = l.indexOf(t.id)));
            return (-1 === e ? 999 : e) - (-1 === t ? 999 : t);
          })
        : r,
      c = t
        ? n.filter(
            (e) =>
              e.name.toLowerCase().includes(t) ||
              (e.desc || "").toLowerCase().includes(t),
          )
        : n,
      p =
        (!c.length && t
          ? i.createDiv({ cls: "cli-empty", text: "没有匹配的内置预设" })
          : c.forEach((e, t) =>
              this._renderPresetCard(
                a,
                e,
                !1,
                t,
                c,
                async (e) => {
                  ((this.plugin.settings.hiddenBuiltinPresets = [
                    ...(this.plugin.settings.hiddenBuiltinPresets || []),
                    e,
                  ]),
                    await this.plugin.saveSettings(),
                    this.render());
                },
                async (e, t) => {
                  var a = n.map((e) => e.id),
                    [e] = a.splice(e, 1);
                  (a.splice(t, 0, e),
                    (this.plugin.settings.builtinPresetOrder = a),
                    await this.plugin.saveSettings(),
                    this.render());
                },
              ),
            ),
        e.createDiv({ cls: "cli-section" }));
    ((r = p.createDiv({ cls: "cli-section-header" })),
      r.createEl("h3", { text: "我的预设", cls: "cli-section-title" }),
      (i = r.createEl("button", {
        cls: "cli-btn-add",
        attr: { title: "导入分享码" },
      })));
    (setIcon(i, "download"), i.createSpan({ text: " 导入" }));
    let o = p.createDiv({ cls: "cli-preset-import-bar" }),
      d =
        ((o.style.display = "none"),
        o.createEl("input", {
          cls: "cli-preset-import-input",
          attr: {
            type: "text",
            placeholder: "粘贴分享码（cli-preset:... 或 cli-preset-raw:...）",
          },
        }));
    var e = o.createEl("button", { cls: "cli-btn-small cli-btn-exec" }),
      u =
        (setIcon(e, "check"),
        e.createSpan({ text: " 确认导入" }),
        o.createEl("button", { cls: "cli-btn-small" }));
    (setIcon(u, "x"),
      this._on(i, "click", () => {
        ((o.style.display = "none" === o.style.display ? "flex" : "none"),
          "none" !== o.style.display && d.focus());
      }),
      this._on(u, "click", () => {
        ((o.style.display = "none"), (d.value = ""));
      }));
    let m = async () => {
        var a = d.value.trim();
        if (a)
          try {
            let e;
            if (a.startsWith("cli-preset-raw:")) {
              var t = decodeURIComponent(
                  escape(atob(a.slice("cli-preset-raw:".length))),
                ),
                i = JSON.parse(t);
              if (!i.name || !i.command) throw new Error("格式错误");
              e = {
                name: i.name,
                desc: i.desc || "",
                command: i.command,
                lucideIcon: i.lucideIcon || null,
              };
            } else {
              if (!a.startsWith("cli-preset:"))
                throw new Error(
                  "分享码格式不正确，应以 cli-preset: 或 cli-preset-raw: 开头",
                );
              {
                var s = decodeURIComponent(
                  escape(atob(a.slice("cli-preset:".length))),
                );
                let t = JSON.parse(s);
                if (!t.name || !t.commandId) throw new Error("格式错误");
                var l = CLI_COMMANDS.find((e) => e.id === t.commandId);
                if (!l) throw new Error("未知命令：" + t.commandId);
                var r = buildCommandString(l, t.defaultParams || {});
                e = {
                  name: t.name,
                  desc: t.desc || "",
                  command: r,
                  commandId: t.commandId,
                  params: t.defaultParams || {},
                  quickInput: t.quickInput || null,
                  lucideIcon: t.lucideIcon || null,
                };
              }
            }
            (this.plugin.settings.userPresets.push(e),
              await this.plugin.saveSettings(),
              new obsidian.Notice(`已导入预设「${e.name}」`),
              (o.style.display = "none"),
              (d.value = ""),
              this.render());
          } catch (e) {
            new obsidian.Notice("导入失败：" + e.message);
          }
        else new obsidian.Notice("请粘贴分享码");
      },
      h =
        (this._on(e, "click", m),
        this._on(d, "keydown", (e) => {
          ("Enter" === e.key && m(),
            "Escape" === e.key && ((o.style.display = "none"), (d.value = "")));
        }),
        this.plugin.settings.userPresets),
      g = this.plugin.settings.userPresetGroups || [],
      v = t
        ? h.filter(
            (e) =>
              e.name.toLowerCase().includes(t) ||
              (e.desc || "").toLowerCase().includes(t) ||
              (e.command || "").toLowerCase().includes(t),
          )
        : h;
    i = r.createEl("button", {
      cls: "cli-btn-add cli-btn-new-group",
      attr: { title: "新建分组" },
    });
    if (
      (setIcon(i, "folder-plus"),
      i.createSpan({ text: " 新建组" }),
      this._on(i, "click", () => {
        new QuickInputModal(
          this.app,
          this.plugin,
          "新建预设分组",
          "输入组名...",
          async (e) => {
            e = e.trim();
            e &&
              (g.includes(e)
                ? new obsidian.Notice("组名已存在")
                : ((this.plugin.settings.userPresetGroups = [...g, e]),
                  await this.plugin.saveSettings(),
                  this.render()));
          },
        ).open();
      }),
      h.length)
    )
      if (v.length) {
        let o = g.length ? g : [];
        o.forEach((i) => {
          var e = v.filter((e) => e.group === i),
            t = p.createDiv({ cls: "cli-preset-group" }),
            a = t.createDiv({ cls: "cli-preset-group-hdr" }),
            s = !!(this.plugin.settings.presetGroupCollapsed || {})[i];
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
                    ? g.includes(t)
                      ? (new obsidian.Notice("组名已存在"), a.replaceWith(r))
                      : (-1 !==
                          (e =
                            this.plugin.settings.userPresetGroups.indexOf(i)) &&
                          (this.plugin.settings.userPresetGroups[e] = t),
                        h.forEach((e) => {
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
                    (h.forEach((e) => {
                      e.group === i && delete e.group;
                    }),
                      (this.plugin.settings.userPresetGroups = g.filter(
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
                (((e = this.plugin.settings.presetGroupCollapsed || {})[i] =
                  !e[i]),
                (this.plugin.settings.presetGroupCollapsed = e),
                await this.plugin.saveSettings(),
                (e = e[i]),
                (c.style.display = e ? "none" : ""),
                l.empty(),
                setIcon(l, e ? "chevron-right" : "chevron-down"));
            }),
            0 === e.length
              ? c.createDiv({ cls: "cli-empty", text: "此组暂无预设" })
              : e.forEach((e) => {
                  var t = h.indexOf(e);
                  this._renderUserPreset(c, e, t, o);
                }));
        });
        u = v.filter((e) => !e.group || !o.includes(e.group));
        if (0 < u.length) {
          e = p.createDiv({
            cls: "cli-preset-group cli-preset-group-ungrouped",
          });
          if (0 < o.length) {
            r = e.createDiv({ cls: "cli-preset-group-hdr" });
            let t = r.createSpan({ cls: "cli-preset-group-arrow" });
            var i = !!(this.plugin.settings.presetGroupCollapsed || {})
                .__ungrouped__,
              f =
                (setIcon(t, i ? "chevron-right" : "chevron-down"),
                r.createSpan({ cls: "cli-preset-group-icon" }));
            (setIcon(f, "folder-open"),
              r.createSpan({ cls: "cli-preset-group-name", text: "未分组" }),
              r.createSpan({
                cls: "cli-preset-group-count",
                text: `(${u.length})`,
              }));
            let a = e.createDiv({
              cls: "cli-preset-group-body cli-preset-grid",
            });
            (i && (a.style.display = "none"),
              this._on(r, "click", async () => {
                var e = this.plugin.settings.presetGroupCollapsed || {},
                  e =
                    ((e.__ungrouped__ = !e.__ungrouped__),
                    (this.plugin.settings.presetGroupCollapsed = e),
                    await this.plugin.saveSettings(),
                    e.__ungrouped__);
                ((a.style.display = e ? "none" : ""),
                  t.empty(),
                  setIcon(t, e ? "chevron-right" : "chevron-down"));
              }),
              u.forEach((e) => {
                var t = h.indexOf(e);
                this._renderUserPreset(a, e, t, o);
              }));
          } else {
            let a = e.createDiv({ cls: "cli-preset-grid" });
            u.forEach((e) => {
              var t = h.indexOf(e);
              this._renderUserPreset(a, e, t, o);
            });
          }
        }
      } else p.createDiv({ cls: "cli-empty", text: "没有匹配的用户预设" });
    else
      p.createDiv({
        cls: "cli-empty",
        text: "还没有自定义预设\n在命令构建器中点击「保存为预设」来创建",
      });
  }

export function renderPresetCard(i, l, e, s, t, a, r) {
    let n = i.createDiv({ cls: "cli-preset-card " + (e ? "is-compact" : "") });
    var c = n.createDiv({ cls: "cli-preset-card-header" }),
      c =
        (setIcon(
          c.createSpan({ cls: "cli-preset-icon" }),
          l.lucideIcon || "zap",
        ),
        c.createSpan({ cls: "cli-preset-name", text: l.name }),
        c.createDiv({ cls: "cli-preset-hdr-actions" })),
      o = c.createEl("button", {
        cls: "cli-preset-icon-btn cli-preset-icon-btn-run",
        attr: { title: "执行" },
      }),
      p =
        (setIcon(o, "play"),
        c.createEl("button", {
          cls: "cli-preset-icon-btn",
          attr: { title: "分享此预设" },
        }));
    if (
      (setIcon(p, "share-2"),
      this._on(p, "click", (e) => {
        e.stopPropagation();
        e = {
          name: l.name,
          desc: l.desc || "",
          commandId: l.commandId,
          defaultParams: l.defaultParams || {},
          quickInput: l.quickInput || null,
          lucideIcon: l.lucideIcon || null,
        };
        let t = btoa(unescape(encodeURIComponent(JSON.stringify(e))));
        navigator.clipboard
          .writeText("cli-preset:" + t)
          .then(() => {
            new obsidian.Notice("已复制分享码，其他用户可在「我的预设」中导入");
          })
          .catch(() => {
            new obsidian.Notice("分享码：cli-preset:" + t);
          });
      }),
      a)
    ) {
      let t = c.createEl("button", {
        cls: "cli-preset-icon-btn cli-preset-icon-btn-danger",
        attr: { title: "隐藏此预设" },
      });
      (setIcon(t, "trash-2"),
        this._on(t, "click", (e) => {
          (e.stopPropagation(), this._confirmDanger(t, () => a(l.id)));
        }));
    }
    if (
      (r &&
        (setIcon(
          c.createEl("button", {
            cls: "cli-preset-icon-btn cli-preset-drag-handle",
            attr: { title: "拖拽排序", draggable: "false" },
          }),
          "grip-vertical",
        ),
        n.setAttribute("draggable", "true"),
        this._on(n, "mousedown", (e) => {
          e = e.target.tagName;
          if ("TEXTAREA" === e || "INPUT" === e) {
            n.setAttribute("draggable", "false");
            let e = () => {
              (n.setAttribute("draggable", "true"),
                document.removeEventListener("mouseup", e));
            };
            document.addEventListener("mouseup", e);
          }
        }),
        this._on(n, "dragstart", (e) => {
          "TEXTAREA" === e.target.tagName || "INPUT" === e.target.tagName
            ? e.preventDefault()
            : ((e.dataTransfer.effectAllowed = "move"),
              e.dataTransfer.setData("text/plain", String(s)),
              setTimeout(() => n.addClass("cli-preset-dragging"), 0));
        }),
        this._on(n, "dragend", () => {
          (n.removeClass("cli-preset-dragging"),
            CLICommanderView._hideDragLine(),
            i
              .querySelectorAll(".cli-preset-drag-over")
              .forEach((e) => e.removeClass("cli-preset-drag-over")));
        }),
        this._on(n, "dragover", (e) => {
          (e.preventDefault(), (e.dataTransfer.dropEffect = "move"));
          var t = n.getBoundingClientRect(),
            e = e.clientY > t.top + t.height / 2;
          ((n.dataset.dropAfter = e ? "1" : "0"),
            CLICommanderView._showDragLine(n, e));
        }),
        this._on(n, "dragleave", (e) => {
          n.contains(e.relatedTarget) || CLICommanderView._hideDragLine();
        }),
        this._on(n, "drop", async (e) => {
          (e.preventDefault(),
            CLICommanderView._hideDragLine(),
            n.removeClass("cli-preset-drag-over"));
          var t,
            e = parseInt(e.dataTransfer.getData("text/plain")),
            a = "1" === n.dataset.dropAfter;
          e !== s &&
            (t = Array.from(i.children)[e]) &&
            (a ? n.insertAdjacentElement("afterend", t) : i.insertBefore(t, n),
            await r(e, s));
        })),
      l.quickInput)
    ) {
      ((p = n.createDiv({ cls: "cli-preset-input-wrap" })),
        (c = "content" === l.quickInput.param));
      let s = c
          ? p.createEl("textarea", {
              cls: "cli-preset-quick-input cli-preset-quick-textarea",
              attr: {
                placeholder: l.quickInput.placeholder,
                rows: "3",
                draggable: "false",
              },
            })
          : p.createEl("input", {
              cls: "cli-preset-quick-input",
              attr: {
                type: "text",
                placeholder: l.quickInput.placeholder,
                draggable: "false",
              },
            }),
        t =
          (this._on(s, "dragstart", (e) => {
            (e.preventDefault(), e.stopPropagation());
          }),
          "template" === l.quickInput.param && this._attachTemplatePicker(s),
          async () => {
            var e = s.value.trim();
            if (e) {
              var e = { ...l.defaultParams, [l.quickInput.param]: e },
                t = CLI_COMMANDS.find((e) => e.id === l.commandId);
              if (t) {
                "create" !== t.id ||
                  "template" !== l.quickInput.param ||
                  (void 0 !== e.name && "" !== e.name) ||
                  (void 0 !== e.path && "" !== e.path) ||
                  ((a = getNewNoteFolderPath(this.app)),
                  (e.path = getUniqueUntitledPath(this.app, a)));
                var a = buildCommandString(t, e);
                try {
                  var i = await this.plugin.executeCLI(a);
                  (this._showResult(i, !1), this._addHistory(a, t, i, !0));
                } catch (e) {
                  (this._showResult(e.message, !0),
                    this._addHistory(a, t, e.message, !1));
                }
                s.value = "";
              }
            } else new obsidian.Notice("请输入内容");
          });
      (this._on(o, "click", (e) => {
        (e.stopPropagation(), t());
      }),
        c
          ? this._on(s, "keydown", (e) => {
              "Enter" !== e.key || e.shiftKey || (e.preventDefault(), t());
            })
          : this._on(s, "keydown", (e) => {
              "Enter" === e.key && t();
            }));
    } else
      this._on(o, "click", async (e) => {
        e.stopPropagation();
        var t = CLI_COMMANDS.find((e) => e.id === l.commandId);
        if (t) {
          var a = buildCommandString(t, l.defaultParams);
          try {
            var i = await this.plugin.executeCLI(a);
            (this._showResult(i, !1), this._addHistory(a, t, i, !0));
          } catch (e) {
            (this._showResult(e.message, !0),
              this._addHistory(a, t, e.message, !1));
          }
        }
      });
    n.createDiv({
      cls: "cli-preset-desc" + (e ? " is-compact-desc" : ""),
      text: l.desc,
    });
  }
