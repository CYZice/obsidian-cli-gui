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

export function renderHome(e) {
    var e = e.createDiv({ cls: "cli-home" }),
      m = e
        .createDiv({ cls: "cli-search-wrap" })
        .createDiv({ cls: "cli-search-inner" });
    setIcon(m.createSpan({ cls: "cli-search-icon" }), "search");
    let t = m.createEl("input", {
        cls: "cli-search-input",
        attr: { type: "text", placeholder: "搜索命令..." },
      }),
      a =
        ((t.value = this.searchQ), e.createDiv({ cls: "cli-search-results" }));
    if (
      (this._on(t, "input", () => {
        ((this.searchQ = t.value), this._renderSearchResults(a));
      }),
      this.searchQ)
    )
      this._renderSearchResults(a);
    else {
      var m = e.createDiv({ cls: "cli-section" }),
        h = m.createDiv({ cls: "cli-section-header" });
      h.createEl("h3", { text: "快捷操作", cls: "cli-section-title" });
      let t = h.createEl("button", {
          cls: "cli-btn-add",
          attr: { title: "添加快捷操作" },
        }),
        i =
          (setIcon(t, "plus"),
          t.createSpan({ text: " 添加" }),
          this.plugin.settings.homePresetIds ||
            BUILTIN_PRESETS.slice(0, 8).map((e) => e.id));
      let a = i
          .map((t) => {
            var e;
            if (t.startsWith("cmd:"))
              return (a = CLI_COMMANDS.find((e) => e.id === t.slice(4)))
                ? { id: t, type: "cmd", data: a }
                : null;
            if (t.startsWith("user:")) {
              var a = parseInt(t.slice(5));
              let e = (this.plugin.settings.userPresets || [])[a];
              return e ? { id: t, type: "user", data: e, idx: a } : null;
            }
            if (t.startsWith("wf:"))
              return (
                (a = parseInt(t.slice(3))),
                (e = (this.plugin.settings.workflows || [])[a])
                  ? { id: t, type: "wf", data: e, idx: a }
                  : null
              );
            if (t.startsWith("eval:"))
              return (
                (e = parseInt(t.slice(5))),
                (a = (this.plugin.settings.evalSnippets || [])[e])
                  ? { id: t, type: "eval", data: a, idx: e }
                  : null
              );
            let i = BUILTIN_PRESETS.find((e) => e.id === t);
            return i ? { id: t, type: "builtin", data: i } : null;
          })
          .filter(Boolean),
        s = m.createDiv({ cls: "cli-home-add-picker" });
      s.style.display = "none";
      h = s.createDiv({ cls: "cli-home-picker-search-wrap" });
      setIcon(h.createSpan({ cls: "cli-search-icon" }), "search");
      let l = h.createEl("input", {
          cls: "cli-search-input",
          attr: { type: "text", placeholder: "搜索命令、预设、序列..." },
        }),
        r = s.createDiv({ cls: "cli-home-picker-list" }),
        n = () => {
          let a = [];
          return (
            CLI_COMMANDS.forEach((t) =>
              a.push({
                id: "cmd:" + t.id,
                label: t.name,
                sub: t.desc,
                icon: "terminal",
                type: "命令",
                onAdd: async () => {
                  var e = [
                    ...(this.plugin.settings.homePresetIds ||
                      BUILTIN_PRESETS.slice(0, 8).map((e) => e.id)),
                  ];
                  (e.includes("cmd:" + t.id) || e.push("cmd:" + t.id),
                    (this.plugin.settings.homePresetIds = e),
                    await this.plugin.saveSettings(),
                    this.render());
                },
              }),
            ),
            BUILTIN_PRESETS.forEach((t) =>
              a.push({
                id: t.id,
                label: t.name,
                sub: t.desc,
                icon: t.lucideIcon || "zap",
                type: "内置",
                onAdd: async () => {
                  var e = [...i];
                  (e.includes(t.id) || e.push(t.id),
                    (this.plugin.settings.homePresetIds = e),
                    await this.plugin.saveSettings(),
                    this.render());
                },
              }),
            ),
            (this.plugin.settings.userPresets || []).forEach((e, t) =>
              a.push({
                id: "user:" + t,
                label: e.name,
                sub: e.command,
                icon: e.lucideIcon || "zap",
                type: "用户",
                onAdd: async () => {
                  var e = [...i];
                  (e.includes("user:" + t) || e.push("user:" + t),
                    (this.plugin.settings.homePresetIds = e),
                    await this.plugin.saveSettings(),
                    this.render());
                },
              }),
            ),
            (this.plugin.settings.workflows || []).forEach((e, t) =>
              a.push({
                id: "wf:" + t,
                label: e.name,
                sub: e.steps.length + " 步序列",
                icon: "list-ordered",
                type: "序列",
                onAdd: async () => {
                  var e = [...i];
                  (e.includes("wf:" + t) || e.push("wf:" + t),
                    (this.plugin.settings.homePresetIds = e),
                    await this.plugin.saveSettings(),
                    this.render());
                },
              }),
            ),
            (this.plugin.settings.evalSnippets || []).forEach((e, t) =>
              a.push({
                id: "eval:" + t,
                label: e.name,
                sub: e.code.slice(0, 60).replace(/\n/g, " "),
                icon: "code-2",
                type: "脚本",
                onAdd: async () => {
                  var e = [...i];
                  (e.includes("eval:" + t) || e.push("eval:" + t),
                    (this.plugin.settings.homePresetIds = e),
                    await this.plugin.saveSettings(),
                    this.render());
                },
              }),
            ),
            a
          );
        },
        c = (e = "") => {
          r.empty();
          let t = e.toLowerCase().trim();
          ((e = n().filter((e) => !i.includes(e.id))),
            (e = t
              ? e.filter(
                  (e) =>
                    e.label.toLowerCase().includes(t) ||
                    (e.sub || "").toLowerCase().includes(t),
                )
              : e));
          e.length
            ? e.forEach((t) => {
                var e = r.createDiv({ cls: "cli-home-add-item" }),
                  a =
                    (setIcon(e.createSpan({ cls: "cli-preset-icon" }), t.icon),
                    e.createDiv({ cls: "cli-home-add-item-info" }));
                (a.createSpan({
                  cls: "cli-home-add-item-label",
                  text: t.label,
                }),
                  a.createSpan({ cls: "cli-home-add-item-type", text: t.type }),
                  this._on(e, "mousedown", (e) => {
                    (e.preventDefault(),
                      t.onAdd(),
                      (s.style.display = "none"),
                      (l.value = ""));
                  }));
              })
            : r.createDiv({
                cls: "cli-empty",
                text: t ? "无匹配结果" : "所有项目已添加",
              });
        },
        o =
          (this._on(l, "input", () => c(l.value)),
          this._on(t, "click", (e) => {
            e.stopPropagation();
            e = "none" !== s.style.display;
            ((s.style.display = e ? "none" : "block"),
              e || ((l.value = ""), c(), l.focus()));
          }),
          this._on(document, "click", (e) => {
            s.contains(e.target) ||
              e.target === t ||
              (s.style.display = "none");
          }),
          m.createDiv({ cls: "cli-preset-grid" })),
        p = async (t) => {
          ((this.plugin.settings.homePresetIds = i.filter((e) => e !== t)),
            await this.plugin.saveSettings(),
            this.render());
        },
        d = async (e, t) => {
          var a = [...i],
            [e] = a.splice(e, 1);
          (a.splice(t, 0, e),
            (this.plugin.settings.homePresetIds = a),
            await this.plugin.saveSettings(),
            this.render());
        };
      a.forEach((e, t) => {
        "builtin" === e.type
          ? this._renderPresetCard(o, e.data, !0, t, a, async () => p(e.id), d)
          : this._renderHomeItemCard(o, e, t, a, p, d);
      });
      h = e.createDiv({ cls: "cli-section" });
      h.createEl("h3", { text: "命令类别", cls: "cli-section-title" });
      let u = h.createDiv({ cls: "cli-category-grid" });
      CLI_CATEGORIES.forEach((t) => {
        var e = u.createDiv({ cls: "cli-category-card" }),
          a =
            (setIcon(
              e.createDiv({ cls: "cli-category-icon" }),
              getCategoryIcon(t.id),
            ),
            e.createDiv({
              cls: "cli-category-name",
              text: t.name.replace(/^[\p{Emoji}\s]+/u, "").trim(),
            }),
            CLI_COMMANDS.filter((e) => e.category === t.id).length);
        (e.createDiv({ cls: "cli-category-count", text: a + " 个命令" }),
          this._on(e, "click", () => {
            ((this.selCat = t.id),
              (this.selCmd = null),
              (this.vals = {}),
              (this.page = "builder"),
              this.render());
          }));
      });
    }
  }

export function renderSearchResults(i) {
    if ((i.empty(), this.searchQ.trim())) {
      let t = this.searchQ.toLowerCase();
      var e = CLI_COMMANDS.filter(
        (e) =>
          e.name.toLowerCase().includes(t) ||
          e.desc.toLowerCase().includes(t) ||
          e.id.toLowerCase().includes(t),
      );
      e.length
        ? e.forEach((e) => {
            var t = i.createDiv({ cls: "cli-search-item" }),
              a =
                (setIcon(
                  t.createSpan({ cls: "cli-search-item-icon" }),
                  getCategoryIcon(e.category),
                ),
                t.createDiv({ cls: "cli-search-item-info" }));
            (a.createDiv({ cls: "cli-search-item-name", text: e.name }),
              a.createDiv({ cls: "cli-search-item-desc", text: e.desc }),
              t.createDiv({ cls: "cli-search-item-id", text: e.id }),
              this._on(t, "click", () => {
                ((this.selCat = e.category),
                  (this.selCmd = e),
                  (this.vals = {}),
                  (this.page = "builder"),
                  this.render());
              }));
          })
        : i.createDiv({ cls: "cli-empty", text: "没有找到匹配的命令" });
    }
  }

export function renderHomeItemCard(e, i, t, a, s, l) {
    let { type: r, data: p, id: n } = i,
      c,
      o,
      d,
      u,
      m =
        ("cmd" === r
          ? ((c = "terminal"),
            (o = p.name),
            (d = p.desc),
            (u = async () => {
              var t = "obsidian " + p.id;
              try {
                var e = await this.plugin.executeCLI(t);
                (this._showResult(e, !1), this._addHistory(t, p, e, !0));
              } catch (e) {
                (this._showResult(e.message, !0),
                  this._addHistory(t, p, e.message, !1));
              }
            }))
          : "user" === r
            ? ((c = p.lucideIcon || "zap"),
              (o = p.name),
              (d = p.desc || p.command),
              (u = null))
            : "wf" === r
              ? ((c = "list-ordered"),
                (o = p.name),
                (d = p.steps.length + " 步序列"),
                (u = () => this._runWorkflow(p)))
              : "eval" === r &&
                ((c = "code-2"),
                (o = p.name),
                (d =
                  p.code.split("\n").find((e) => !e.startsWith("//")) ||
                  p.code.slice(0, 50)),
                (u = async () => {
                  var t = { id: "eval", name: p.name };
                  try {
                    var a = new (Object.getPrototypeOf(
                        async function () {},
                      ).constructor)(
                        "app",
                        "plugin",
                        "obsidian",
                        "executeCLI",
                        p.code,
                      ),
                      i = await a(this.app, this.plugin, obsidian, (e) =>
                        this.plugin.executeCLI(e),
                      );
                    let e;
                    ((e =
                      null == i
                        ? "(脚本执行完毕，无返回值)"
                        : "object" == typeof i
                          ? JSON.stringify(i, null, 2)
                          : String(i)),
                      this._showResult(e, !1),
                      this._addHistory(p.code, t, e, !0));
                  } catch (e) {
                    (this._showResult(e.message, !0),
                      this._addHistory(p.code, t, e.message, !1));
                  }
                })),
        e.createDiv({ cls: "cli-preset-card is-compact" }));
    ((i = m.createDiv({ cls: "cli-preset-card-header" })),
      setIcon(i.createSpan({ cls: "cli-preset-icon" }), c),
      i.createSpan({ cls: "cli-preset-name", text: o }),
      (e = i.createDiv({ cls: "cli-preset-hdr-actions" })),
      (i = e.createEl("button", {
        cls: "cli-preset-icon-btn cli-preset-icon-btn-run",
        attr: { title: "执行" },
      })));
    setIcon(i, "play");
    let h = e.createEl("button", {
      cls: "cli-preset-icon-btn cli-preset-icon-btn-danger",
      attr: { title: "从首页移除" },
    });
    if (
      (setIcon(h, "trash-2"),
      this._on(h, "click", (e) => {
        (e.stopPropagation(), this._confirmDanger(h, () => s(n)));
      }),
      setIcon(
        e.createEl("button", {
          cls: "cli-preset-icon-btn cli-preset-drag-handle",
          attr: { title: "拖拽排序", draggable: "false" },
        }),
        "grip-vertical",
      ),
      m.setAttribute("draggable", "true"),
      this._on(m, "mousedown", (e) => {
        e = e.target.tagName;
        if ("TEXTAREA" === e || "INPUT" === e) {
          m.setAttribute("draggable", "false");
          let e = () => {
            (m.setAttribute("draggable", "true"),
              document.removeEventListener("mouseup", e));
          };
          document.addEventListener("mouseup", e);
        }
      }),
      this._on(m, "dragstart", (e) => {
        "TEXTAREA" === e.target.tagName || "INPUT" === e.target.tagName
          ? e.preventDefault()
          : ((e.dataTransfer.effectAllowed = "move"),
            e.dataTransfer.setData("text/plain", String(t)),
            m.addClass("cli-preset-dragging"));
      }),
      this._on(m, "dragend", () => {
        (m.removeClass("cli-preset-dragging"),
          m.removeClass("cli-preset-drag-over"));
      }),
      this._on(m, "dragover", (e) => {
        (e.preventDefault(),
          (e.dataTransfer.dropEffect = "move"),
          m.addClass("cli-preset-drag-over"));
      }),
      this._on(m, "dragleave", () => {
        m.removeClass("cli-preset-drag-over");
      }),
      this._on(m, "drop", async (e) => {
        (e.preventDefault(), m.removeClass("cli-preset-drag-over"));
        e = parseInt(e.dataTransfer.getData("text/plain"));
        e !== t && (await l(e, t));
      }),
      "user" === r && p.quickInputs && 0 < p.quickInputs.length)
    ) {
      let s = p,
        l = s.quickInputs,
        r = CLI_COMMANDS.find((e) => e.id === s.commandId),
        n = { ...(s.params || {}) },
        t =
          (l.forEach((e) => {
            n[e.param] = "";
          }),
          m.createDiv({ cls: "cli-params-section cli-preset-params-section" })),
        c = (t) => {
          if (r) {
            var e = r.params.find((e) => e.name === t);
            if (e) return e;
          }
          e = l.find((e) => e.param === t);
          return {
            name: t,
            label: e?.label || t,
            type: "textarea" === e?.type ? "textarea" : "text",
            placeholder: e?.placeholder || "",
          };
        },
        o = {},
        a =
          (l.forEach((a) => {
            let i = c(a.param);
            var a = t.createDiv({ cls: "cli-param-field" }),
              e = a.createDiv({ cls: "cli-param-label-row" });
            if (
              (e.createSpan({ cls: "cli-param-label", text: i.label }),
              i.required &&
                e.createSpan({ cls: "cli-param-required", text: "必填" }),
              "textarea" === i.type)
            ) {
              let e = a.createEl("textarea", {
                cls: "cli-param-textarea",
                attr: { placeholder: i.placeholder || "", rows: 3 },
              });
              ((e.value = n[i.name] || ""),
                this._on(e, "input", () => {
                  n[i.name] = e.value;
                }),
                this._on(e, "dragstart", (e) => {
                  (e.preventDefault(), e.stopPropagation());
                }),
                (o[i.name] = e));
            } else {
              let t = a.createEl("input", {
                cls: "cli-param-input",
                attr: {
                  type: "text",
                  placeholder: i.placeholder || "",
                  value: n[i.name] || "",
                },
              });
              (this._on(t, "input", () => {
                n[i.name] = t.value;
              }),
                this._on(t, "dragstart", (e) => {
                  (e.preventDefault(), e.stopPropagation());
                }));
              e = i.name.toLowerCase();
              ("template" === i.name
                ? this._attachTemplatePicker(t, (e) => {
                    ((n[i.name] = e), (t.value = e));
                  })
                : "file" === i.name
                  ? this._attachFilePicker(t, "name", (e) => {
                      ((n[i.name] = e), (t.value = e));
                    })
                  : "to" === i.name
                    ? this._attachFolderPicker(t, (e) => {
                        ((n[i.name] = e), (t.value = e));
                      })
                    : e.includes("path")
                      ? this._attachFilePicker(t, "path", (e) => {
                          ((n[i.name] = e), (t.value = e));
                        })
                      : e.includes("folder") &&
                        this._attachFolderPicker(t, (e) => {
                          ((n[i.name] = e), (t.value = e));
                        }),
                (o[i.name] = t));
            }
            a.createDiv({ cls: "cli-param-hint", text: "参数: " + i.name });
          }),
          async () => {
            var i = l.filter(
              (e) => c(e.param).required && !String(n[e.param] || "").trim(),
            );
            if (i.length)
              new obsidian.Notice(
                "请填写必填参数: " +
                  i.map((e) => e.label || e.param).join(", "),
              );
            else {
              let a = { ...s.params };
              l.forEach((e) => {
                var t = String(n[e.param] || "").trim();
                t && (a[e.param] = t);
              });
              let t;
              t = r
                ? ("create" !== r.id ||
                    !n.template ||
                    a.name ||
                    a.path ||
                    ((i = getNewNoteFolderPath(this.app)),
                    (a.path = getUniqueUntitledPath(this.app, i))),
                  buildCommandString(r, a))
                : s.command;
              i = { id: s.commandId || "user-preset", name: s.name };
              try {
                var e = await this.plugin.executeCLI(t);
                (this._showResult(e, !1), this._addHistory(t, i, e, !0));
              } catch (e) {
                (this._showResult(e.message, !0),
                  this._addHistory(t, i, e.message, !1));
              }
              l.forEach((e) => {
                ((n[e.param] = ""), o[e.param] && (o[e.param].value = ""));
              });
            }
          });
      (this._on(i, "click", (e) => {
        (e.stopPropagation(), a());
      }),
        l.forEach((e) => {
          var e = c(e.param),
            t = o[e.name];
          t &&
            ("textarea" === e.type
              ? this._on(t, "keydown", (e) => {
                  "Enter" !== e.key || e.shiftKey || (e.preventDefault(), a());
                })
              : this._on(t, "keydown", (e) => {
                  "Enter" === e.key && a();
                }));
        }));
    } else {
      let t =
        u ||
        ("user" === r
          ? async () => {
              var t = { id: p.commandId || "user-preset", name: p.name };
              try {
                var e = await this.plugin.executeCLI(p.command);
                (this._showResult(e, !1),
                  this._addHistory(p.command, t, e, !0));
              } catch (e) {
                (this._showResult(e.message, !0),
                  this._addHistory(p.command, t, e.message, !1));
              }
            }
          : u);
      t &&
        this._on(i, "click", (e) => {
          (e.stopPropagation(), t());
        });
    }
    d && m.createDiv({ cls: "cli-preset-desc is-compact-desc", text: d });
  }

export function renderUserPreset(e, c, l, s) {
    let o = e.createDiv({ cls: "cli-preset-card cli-user-preset" });
    var i = o.createDiv({ cls: "cli-preset-card-header" });
    (setIcon(i.createSpan({ cls: "cli-preset-icon" }), c.lucideIcon || "zap"),
      i.createSpan({ cls: "cli-preset-name", text: c.name }));
    let r = i.createDiv({ cls: "cli-preset-hdr-actions" });
    var i = r.createEl("button", {
        cls: "cli-preset-icon-btn cli-preset-icon-btn-run",
        attr: { title: "执行" },
      }),
      t =
        (setIcon(i, "play"),
        this._on(i, "click", async (e) => {
          e.stopPropagation();
          var t = { id: c.commandId || "user-preset", name: c.name };
          try {
            var a = await this.plugin.executeCLI(c.command);
            (this._showResult(a, !1), this._addHistory(c.command, t, a, !0));
          } catch (e) {
            (this._showResult(e.message, !0),
              this._addHistory(c.command, t, e.message, !1));
          }
        }),
        r.createEl("button", {
          cls: "cli-preset-icon-btn",
          attr: { title: "分享此预设" },
        })),
      t =
        (setIcon(t, "share-2"),
        this._on(t, "click", (e) => {
          e.stopPropagation();
          e = {
            name: c.name,
            desc: c.desc || "",
            command: c.command,
            lucideIcon: c.lucideIcon || null,
          };
          let t = btoa(unescape(encodeURIComponent(JSON.stringify(e))));
          navigator.clipboard
            .writeText("cli-preset-raw:" + t)
            .then(() => {
              new obsidian.Notice(
                "已复制分享码，其他用户可在「我的预设」中导入",
              );
            })
            .catch(() => {
              new obsidian.Notice("分享码：cli-preset-raw:" + t);
            });
        }),
        r.createEl("button", {
          cls: "cli-preset-icon-btn",
          attr: { title: "编辑" },
        }));
    if (
      (setIcon(t, "pencil"),
      this._on(t, "click", (e) => {
        e.stopPropagation();
        e = CLI_COMMANDS.find((e) => e.id === c.commandId);
        e &&
          ((this.selCmd = e),
          (this.selCat = e.category),
          (this.vals = { ...c.params }),
          (this.page = "builder"),
          this.render());
      }),
      s && 0 < s.length)
    ) {
      let i = r.createEl("button", {
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
            let a = r.createDiv({ cls: "cli-preset-group-picker" });
            (c.group &&
              ((e = a.createDiv({
                cls: "cli-preset-group-picker-item cli-preset-group-picker-remove",
                text: "✕ 移出组",
              })),
              this._on(e, "click", async (e) => {
                (e.stopPropagation(),
                  delete c.group,
                  await this.plugin.saveSettings(),
                  a.remove(),
                  this.render());
              })),
              s.forEach((t) => {
                var e;
                t !== c.group &&
                  ((e = a.createDiv({
                    cls: "cli-preset-group-picker-item",
                    text: t,
                  })),
                  this._on(e, "click", async (e) => {
                    (e.stopPropagation(),
                      (c.group = t),
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
    let a = r.createEl("button", {
        cls: "cli-preset-icon-btn cli-preset-icon-btn-danger",
        attr: { title: "删除" },
      }),
      p =
        (setIcon(a, "trash-2"),
        this._on(a, "click", (e) => {
          (e.stopPropagation(),
            this._confirmDanger(a, async () => {
              (this.plugin.settings.userPresets.splice(l, 1),
                await this.plugin.saveSettings(),
                this.render());
            }));
        }),
        setIcon(
          r.createEl("button", {
            cls: "cli-preset-icon-btn cli-preset-drag-handle",
            attr: { title: "拖拽排序", draggable: "false" },
          }),
          "grip-vertical",
        ),
        c.quickInputs);
    if (p && 0 < p.length) {
      let s = CLI_COMMANDS.find((e) => e.id === c.commandId),
        l = { ...(c.params || {}) },
        t =
          (p.forEach((e) => {
            l[e.param] = "";
          }),
          o.createDiv({ cls: "cli-params-section cli-preset-params-section" })),
        r = (t) => {
          if (s) {
            var e = s.params.find((e) => e.name === t);
            if (e) return e;
          }
          e = p.find((e) => e.param === t);
          return {
            name: t,
            label: e?.label || t,
            type: "textarea" === e?.type ? "textarea" : "text",
            placeholder: e?.placeholder || "",
          };
        },
        n = {},
        a =
          (p.forEach((a) => {
            let i = r(a.param);
            var a = t.createDiv({ cls: "cli-param-field" }),
              e = a.createDiv({ cls: "cli-param-label-row" });
            if (
              (e.createSpan({ cls: "cli-param-label", text: i.label }),
              i.required &&
                e.createSpan({ cls: "cli-param-required", text: "必填" }),
              "textarea" === i.type)
            ) {
              let e = a.createEl("textarea", {
                cls: "cli-param-textarea",
                attr: { placeholder: i.placeholder || "", rows: 3 },
              });
              ((e.value = l[i.name] || ""),
                this._on(e, "input", () => {
                  l[i.name] = e.value;
                }),
                this._on(e, "dragstart", (e) => {
                  (e.preventDefault(), e.stopPropagation());
                }),
                (n[i.name] = e));
            } else {
              let t = a.createEl("input", {
                cls: "cli-param-input",
                attr: {
                  type: "text",
                  placeholder: i.placeholder || "",
                  value: l[i.name] || "",
                },
              });
              (this._on(t, "input", () => {
                l[i.name] = t.value;
              }),
                this._on(t, "dragstart", (e) => {
                  (e.preventDefault(), e.stopPropagation());
                }));
              e = i.name.toLowerCase();
              ("template" === i.name
                ? this._attachTemplatePicker(t, (e) => {
                    ((l[i.name] = e), (t.value = e));
                  })
                : "file" === i.name
                  ? this._attachFilePicker(t, "name", (e) => {
                      ((l[i.name] = e), (t.value = e));
                    })
                  : "to" === i.name
                    ? this._attachFolderPicker(t, (e) => {
                        ((l[i.name] = e), (t.value = e));
                      })
                    : e.includes("path")
                      ? this._attachFilePicker(t, "path", (e) => {
                          ((l[i.name] = e), (t.value = e));
                        })
                      : e.includes("folder") &&
                        this._attachFolderPicker(t, (e) => {
                          ((l[i.name] = e), (t.value = e));
                        }),
                (n[i.name] = t));
            }
            a.createDiv({ cls: "cli-param-hint", text: "参数: " + i.name });
          }),
          async () => {
            var i = p.filter(
              (e) => r(e.param).required && !String(l[e.param] || "").trim(),
            );
            if (i.length)
              new obsidian.Notice(
                "请填写必填参数: " +
                  i.map((e) => e.label || e.param).join(", "),
              );
            else {
              let a = { ...c.params };
              p.forEach((e) => {
                var t = String(l[e.param] || "").trim();
                t && (a[e.param] = t);
              });
              let t;
              t = s
                ? ("create" !== s.id ||
                    !l.template ||
                    a.name ||
                    a.path ||
                    ((i = getNewNoteFolderPath(this.app)),
                    (a.path = getUniqueUntitledPath(this.app, i))),
                  buildCommandString(s, a))
                : c.command;
              i = { id: c.commandId || "user-preset", name: c.name };
              try {
                var e = await this.plugin.executeCLI(t);
                (this._showResult(e, !1), this._addHistory(t, i, e, !0));
              } catch (e) {
                (this._showResult(e.message, !0),
                  this._addHistory(t, i, e.message, !1));
              }
              p.forEach((e) => {
                ((l[e.param] = ""), n[e.param] && (n[e.param].value = ""));
              });
            }
          });
      (this._on(i, "click", (e) => {
        (e.stopPropagation(), a());
      }),
        p.forEach((e) => {
          var e = r(e.param),
            t = n[e.name];
          t &&
            ("textarea" === e.type
              ? this._on(t, "keydown", (e) => {
                  "Enter" !== e.key || e.shiftKey || (e.preventDefault(), a());
                })
              : this._on(t, "keydown", (e) => {
                  "Enter" === e.key && a();
                }));
        }));
    }
    (o.createDiv({ cls: "cli-preset-desc", text: c.desc || c.command }),
      o.setAttribute("draggable", "true"),
      (o.dataset.presetIdx = String(l)),
      this._on(o, "mousedown", (e) => {
        e = e.target.tagName;
        if ("TEXTAREA" === e || "INPUT" === e) {
          o.setAttribute("draggable", "false");
          let e = () => {
            (o.setAttribute("draggable", "true"),
              document.removeEventListener("mouseup", e));
          };
          document.addEventListener("mouseup", e);
        }
      }),
      this._on(o, "dragstart", (e) => {
        "TEXTAREA" === e.target.tagName || "INPUT" === e.target.tagName
          ? e.preventDefault()
          : ((e.dataTransfer.effectAllowed = "move"),
            e.dataTransfer.setData("text/plain", String(l)),
            setTimeout(() => o.addClass("cli-preset-dragging"), 0));
      }),
      this._on(o, "dragend", () => {
        (o.removeClass("cli-preset-dragging"),
          CLICommanderView._hideDragLine(),
          e
            .querySelectorAll(".cli-preset-drag-over")
            .forEach((e) => e.removeClass("cli-preset-drag-over")));
      }),
      this._on(o, "dragover", (e) => {
        (e.preventDefault(), (e.dataTransfer.dropEffect = "move"));
        var t = o.getBoundingClientRect(),
          e = e.clientY > t.top + t.height / 2;
        ((o.dataset.dropAfter = e ? "1" : "0"),
          CLICommanderView._showDragLine(o, e));
      }),
      this._on(o, "dragleave", (e) => {
        o.contains(e.relatedTarget) || CLICommanderView._hideDragLine();
      }),
      this._on(o, "drop", async (t) => {
        (t.preventDefault(),
          CLICommanderView._hideDragLine(),
          o.removeClass("cli-preset-drag-over"));
        let a = parseInt(t.dataTransfer.getData("text/plain"));
        t = "1" === o.dataset.dropAfter;
        if (a !== l || t) {
          var i = Array.from(e.children)
            .filter((e) => e.classList.contains("cli-preset-card"))
            .find((e) => e.dataset.presetIdx === String(a));
          if (i && i !== o) {
            t ? o.insertAdjacentElement("afterend", i) : e.insertBefore(i, o);
            i = this.plugin.settings.userPresets;
            if (a !== l) {
              var [s] = i.splice(a, 1);
              let e = l;
              (a < l && (e = l - 1),
                t && (e += 1),
                i.splice(e, 0, s),
                await this.plugin.saveSettings());
            }
          }
        }
      }));
  }
