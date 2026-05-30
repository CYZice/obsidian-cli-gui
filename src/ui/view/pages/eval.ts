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

export function renderEvalSandbox(e) {
    var e = e.createDiv({ cls: "cli-eval-wrap" }),
      t = e.createDiv({ cls: "cli-eval-topbar" }),
      a = t.createDiv({ cls: "cli-eval-title-wrap" }),
      a =
        (setIcon(a.createSpan({ cls: "cli-eval-title-icon" }), "code-2"),
        a.createSpan({ cls: "cli-eval-title", text: "JS 脚本" }),
        a.createSpan({ cls: "cli-eval-badge", text: "eval" }),
        t.createDiv({ cls: "cli-eval-top-acts" })),
      t = a.createEl("button", {
        cls: "cli-eval-act-btn",
        attr: { title: "清空编辑器" },
      }),
      i =
        (setIcon(t, "brush-cleaning"),
        t.createSpan({ text: " 清空" }),
        a.createEl("button", {
          cls: "cli-eval-act-btn",
          attr: { title: "保存为片段" },
        }));
    (setIcon(i, "save"), i.createSpan({ text: " 保存" }));
    let l = a.createEl("button", {
      cls: "cli-eval-act-btn cli-eval-run-btn",
      attr: { title: "执行脚本 (Ctrl+Enter)" },
    });
    (setIcon(l, "play"), l.createSpan({ text: " 运行" }));
    var a = null,
      s = e.createDiv({ cls: "cli-eval-warn" }),
      s =
        (setIcon(s.createSpan({ cls: "cli-eval-warn-icon" }), "alert-triangle"),
        s.createSpan({
          text: " 脚本通过 Obsidian CLI eval 执行，可调用 app.vault、app.workspace 等 API，请勿运行不信任的代码。",
        }),
        e.createDiv({ cls: "cli-eval-editor-wrap" }));
    let c = s.createEl("textarea", {
      cls: "cli-eval-textarea",
      attr: { spellcheck: "false", autocorrect: "off", autocapitalize: "off" },
    });
    var r = this.plugin.settings.evalLastCode || "";
    ((c.value = r),
      this._on(c, "input", () => {
        ((this.plugin.settings.evalLastCode = c.value),
          this.plugin.saveSettings());
      }),
      this._on(c, "keydown", async (e) => {
        var t, a;
        ("Tab" === e.key &&
          (e.preventDefault(),
          (t = c.selectionStart),
          (a = c.selectionEnd),
          (c.value = c.value.slice(0, t) + "  " + c.value.slice(a)),
          (c.selectionStart = c.selectionEnd = t + 2)),
          (e.ctrlKey || e.metaKey) &&
            "Enter" === e.key &&
            (e.preventDefault(), await f()));
      }));
    let p = this.plugin.settings.evalSnippets || [],
      n = null;
    let d = (e, t, s) => {
        let l = e.createDiv({ cls: "cli-eval-snippet-row" });
        var e = l.createDiv({ cls: "cli-eval-snippet-info" }),
          a = e.createDiv({ cls: "cli-eval-snippet-head" }),
          a =
            (a.createSpan({ cls: "cli-eval-snippet-name", text: t.name }),
            a.createDiv({ cls: "cli-preset-hdr-actions" }));
        e.createSpan({
          cls: "cli-eval-snippet-preview",
          text:
            t.code.slice(0, 60).replace(/\n/g, " ") +
            (60 < t.code.length ? "…" : ""),
        });
        let r = a.createEl("button", {
          cls: "cli-preset-icon-btn",
          attr: { title: "移入分组" },
        });
        (setIcon(r, "folder-symlink"),
          this._on(r, "click", (e) => {
            e.stopPropagation();
            e = this.plugin.settings.evalSnippetGroups || [];
            if (e.length) {
              var i = l.querySelector(".cli-eval-group-picker");
              if (i) i.remove();
              else {
                let a = l.createDiv({ cls: "cli-eval-group-picker" });
                i = a.createDiv({
                  cls: "cli-eval-group-picker-item",
                  text: "（移出分组）",
                });
                (this._on(i, "mousedown", async (e) => {
                  (e.preventDefault(),
                    delete p[s].group,
                    (this.plugin.settings.evalSnippets = p),
                    await this.plugin.saveSettings(),
                    u());
                }),
                  e.forEach((t) => {
                    var e = a.createDiv({
                      cls: "cli-eval-group-picker-item",
                      text: t,
                    });
                    (p[s].group === t && e.addClass("is-active"),
                      this._on(e, "mousedown", async (e) => {
                        (e.preventDefault(),
                          (p[s].group = t),
                          (this.plugin.settings.evalSnippets = p),
                          await this.plugin.saveSettings(),
                          u());
                      }));
                  }));
                let t = (e) => {
                  a.contains(e.target) ||
                    e.target === r ||
                    (a.remove(), document.removeEventListener("mousedown", t));
                };
                setTimeout(() => document.addEventListener("mousedown", t), 0);
              }
            } else new obsidian.Notice("还没有分组，请先新建组");
          }));
        var e = a.createEl("button", {
            cls: "cli-preset-icon-btn",
            attr: { title: "分享此片段" },
          }),
          e =
            (setIcon(e, "share-2"),
            this._on(e, "click", () => {
              let e = btoa(
                unescape(
                  encodeURIComponent(
                    JSON.stringify({ name: t.name, code: t.code }),
                  ),
                ),
              );
              navigator.clipboard
                .writeText("cli-eval-snippet:" + e)
                .then(() => {
                  new obsidian.Notice("已复制分享码");
                })
                .catch(() => {
                  new obsidian.Notice("分享码：cli-eval-snippet:" + e);
                });
            }),
            a.createEl("button", {
              cls: "cli-preset-icon-btn",
              attr: { title: "代码加载到编辑器" },
            })),
          i =
            (setIcon(e, "code-xml"),
            a.createEl("button", {
              cls: "cli-preset-icon-btn",
              attr: { title: "编辑此代码片段" },
            }));
        setIcon(i, "pencil");
        let n = a.createEl("button", {
          cls: "cli-preset-icon-btn cli-preset-icon-btn-danger",
          attr: { title: "删除代码片段" },
        });
        (setIcon(n, "trash-2"),
          this._on(e, "click", () => {
            c.value = t.code;
          }),
          this._on(i, "click", () => {
            ((c.value = t.code), c.focus(), _(s, t.name));
          }),
          this._on(n, "click", async () => {
            this._confirmDanger(n, async () => {
              (p.splice(s, 1),
                (this.plugin.settings.evalSnippets = p),
                await this.plugin.saveSettings(),
                u());
            });
          }));
      },
      o = (e, i, t, a) => {
        this.plugin.settings.evalSnippetGroups;
        var s = this.plugin.settings.evalSnippetGroupCollapsed || {},
          e = e.createDiv({
            cls: a
              ? "cli-preset-group cli-preset-group-ungrouped"
              : "cli-preset-group",
          }),
          l = e.createDiv({ cls: "cli-preset-group-hdr" });
        let r = l.createSpan({ cls: "cli-preset-group-arrow" }),
          n = !a && !!s[i],
          c =
            (setIcon(r, n ? "chevron-right" : "chevron-down"),
            setIcon(
              l.createSpan({ cls: "cli-preset-group-icon" }),
              a ? "folder-open" : "folder",
            ),
            l.createSpan({ cls: "cli-preset-group-name", text: i }));
        if (
          (l.createSpan({
            cls: "cli-preset-group-count",
            text: `(${t.length})`,
          }),
          !a)
        ) {
          this._on(c, "dblclick", (e) => {
            e.stopPropagation();
            let a = document.createElement("input");
            ((a.className = "cli-preset-group-name-input"),
              (a.value = i),
              c.replaceWith(a),
              a.focus(),
              a.select());
            (a.addEventListener("blur", async () => {
              let t = a.value.trim();
              var e;
              t && t !== i
                ? (-1 !==
                    (e = (this.plugin.settings.evalSnippetGroups || []).indexOf(
                      i,
                    )) && (this.plugin.settings.evalSnippetGroups[e] = t),
                  p.forEach((e) => {
                    e.group === i && (e.group = t);
                  }),
                  await this.plugin.saveSettings(),
                  u())
                : a.replaceWith(c);
            }),
              a.addEventListener("keydown", (e) => {
                "Enter" === e.key
                  ? a.blur()
                  : "Escape" === e.key && a.replaceWith(c);
              }));
          });
          let t = l.createEl("button", {
            cls: "cli-preset-icon-btn cli-preset-icon-btn-danger cli-preset-group-del",
            attr: { title: "删除此组" },
          });
          (setIcon(t, "folder-minus"),
            this._on(t, "click", async (e) => {
              (e.stopPropagation(),
                this._confirmDanger(t, async () => {
                  (p.forEach((e) => {
                    e.group === i && delete e.group;
                  }),
                    (this.plugin.settings.evalSnippetGroups = (
                      this.plugin.settings.evalSnippetGroups || []
                    ).filter((e) => e !== i)),
                    await this.plugin.saveSettings(),
                    u());
                }));
            }));
        }
        let o = e.createDiv({ cls: "cli-preset-group-body" });
        (n && (o.style.display = "none"),
          this._on(l, "click", async (e) => {
            e.target.closest("button") ||
              "INPUT" === e.target.tagName ||
              ((n = a
                ? !n
                : (((e = this.plugin.settings.evalSnippetGroupCollapsed || {})[
                    i
                  ] = !e[i]),
                  (this.plugin.settings.evalSnippetGroupCollapsed = e),
                  await this.plugin.saveSettings(),
                  !!e[i])),
              (o.style.display = n ? "none" : ""),
              r.empty(),
              setIcon(r, n ? "chevron-right" : "chevron-down"));
          }),
          t.length
            ? t.forEach(({ s: e, i: t }) => d(o, e, t))
            : o.createDiv({
                cls: "cli-eval-snippet-empty",
                text: a ? "暂无未分组片段" : "此组暂无片段",
              }));
      },
      u = () => {
        if (n) {
          n.empty();
          let t = this.plugin.settings.evalSnippetGroups || [];
          var e;
          p.length
            ? (t.forEach((t) => {
                var e = p
                  .map((e, t) => ({ s: e, i: t }))
                  .filter(({ s: e }) => e.group === t);
                o(n, t, e, !1);
              }),
              (e = p
                .map((e, t) => ({ s: e, i: t }))
                .filter(({ s: e }) => !e.group || !t.includes(e.group))),
              o(n, "未分组", e, !0))
            : n.createDiv({
                cls: "cli-eval-snippet-empty",
                text: "暂无保存的片段",
              });
        }
      };
    var r = e.createDiv({ cls: "cli-eval-snippet-section" }),
      m = r.createDiv({ cls: "cli-section-header" }),
      m =
        (m
          .createDiv({ cls: "cli-eval-snippet-title-wrap" })
          .createSpan({ cls: "cli-section-title", text: "保存的片段" }),
        setIcon(
          (a = m.createEl("button", {
            cls: "cli-btn-add cli-btn-new-group",
            attr: { title: "导入分享片段" },
          })),
          "download",
        ),
        a.createSpan({ text: " 导入" }),
        m.createEl("button", {
          cls: "cli-btn-add cli-btn-new-group",
          attr: { title: "新建分组" },
        })),
      m =
        (setIcon(m, "folder-plus"),
        m.createSpan({ text: " 新建组" }),
        this._on(m, "click", () => {
          new QuickInputModal(
            this.app,
            this.plugin,
            "新建片段分组",
            "输入组名...",
            async (e) => {
              var t,
                e = e.trim();
              e &&
                ((t = this.plugin.settings.evalSnippetGroups || []).includes(e)
                  ? new obsidian.Notice("组名已存在")
                  : ((this.plugin.settings.evalSnippetGroups = [...t, e]),
                    await this.plugin.saveSettings(),
                    u()));
            },
          ).open();
        }),
        (n = r.createDiv({ cls: "cli-eval-snippet-list" })),
        u(),
        e.createDiv({ cls: "cli-eval-snippet-panel" })),
      r = m.createDiv({ cls: "cli-eval-snippet-hdr" });
    let h = r.createSpan({ cls: "cli-eval-snippet-arrow" }),
      g =
        (setIcon(h, "chevron-right"),
        r.createSpan({ cls: "cli-eval-snippet-hdr-label", text: "示例脚本" }),
        m.createDiv({ cls: "cli-eval-snippet-list" })),
      v = !(g.style.display = "none"),
      f =
        (this._on(r, "click", () => {
          ((v = !v),
            (g.style.display = v ? "" : "none"),
            h.empty(),
            setIcon(h, v ? "chevron-down" : "chevron-right"));
        }),
        [
          {
            name: "统计 vault 文件数",
            code: "// 获取 vault 中所有文件的数量\nconst count = app.vault.getFiles().length;\nreturn `vault 共有 ${count} 个文件`;",
          },
          {
            name: "列出最近修改的10个文件",
            code: `// 按修改时间倒序列出最近10个文件
const files = app.vault.getFiles()
  .sort((a, b) => b.stat.mtime - a.stat.mtime)
  .slice(0, 10);
return files.map(f => f.path).join('\\n');`,
          },
          {
            name: "统计各文件夹笔记数",
            code: `// 统计每个顶级文件夹下的笔记数量
const map = {};
app.vault.getFiles().forEach(f => {
  const folder = f.path.split('/')[0];
  map[folder] = (map[folder] || 0) + 1;
});
return JSON.stringify(map, null, 2);`,
          },
          {
            name: "查找包含关键词的笔记",
            code: `// 查找文件名包含指定关键词的笔记
const keyword = 'meeting';
const found = app.vault.getFiles()
  .filter(f => f.basename.toLowerCase().includes(keyword));
return found.length ? found.map(f => f.path).join('\\n') : '未找到匹配文件';`,
          },
          {
            name: "获取当前打开文件信息",
            code: `// 获取当前活跃文件的基本信息
const file = app.workspace.getActiveFile();
if (!file) return '当前没有打开的文件';
return JSON.stringify({
  name: file.basename,
  path: file.path,
  size: file.stat.size,
  modified: new Date(file.stat.mtime).toLocaleString()
}, null, 2);`,
          },
          {
            name: "列出所有标签",
            code: `// 获取 vault 中所有使用过的标签
const tags = Object.keys(app.metadataCache.getTags() || {});
tags.sort();
return tags.length ? tags.join('\\n') : '没有找到标签';`,
          },
        ].forEach((e) => {
          var t = g
              .createDiv({ cls: "cli-eval-snippet-row" })
              .createDiv({ cls: "cli-eval-snippet-info" }),
            a = t.createDiv({ cls: "cli-eval-snippet-head" }),
            a =
              (a.createSpan({ cls: "cli-eval-snippet-name", text: e.name }),
              a.createDiv({ cls: "cli-preset-hdr-actions" })),
            t =
              (t.createSpan({
                cls: "cli-eval-snippet-preview",
                text: e.code.split("\n").find((e) => !e.startsWith("//")) || "",
              }),
              a.createEl("button", {
                cls: "cli-preset-icon-btn",
                attr: { title: "代码加载到编辑器" },
              }));
          (setIcon(t, "code-xml"),
            this._on(t, "click", () => {
              c.value = e.code;
            }));
        }),
        async () => {
          var t = c.value.trim();
          if (t) {
            ((l.disabled = !0),
              l.empty(),
              setIcon(l, "loader"),
              l.createSpan({ text: " 运行中..." }));
            var a = { id: "eval", name: "脚本" };
            try {
              var i = new (Object.getPrototypeOf(
                  async function () {},
                ).constructor)("app", "plugin", "obsidian", "executeCLI", t),
                s = await i(this.app, this.plugin, obsidian, (e) =>
                  this.plugin.executeCLI(e),
                );
              let e;
              ((e =
                null == s
                  ? "(脚本执行完毕，无返回值)"
                  : "object" == typeof s
                    ? JSON.stringify(s, null, 2)
                    : String(s)),
                this._showResult(e, !1),
                this._addHistory(t, a, e, !0));
            } catch (e) {
              (this._showResult(e.message, !0),
                this._addHistory(t, a, e.message, !1));
            } finally {
              ((l.disabled = !1),
                l.empty(),
                setIcon(l, "play"),
                l.createSpan({ text: " 运行" }));
            }
          } else new obsidian.Notice("请输入脚本内容");
        }),
      b = s.createDiv({ cls: "cli-eval-save-inline-wrap is-hidden" }),
      y = b.createEl("input", {
        cls: "cli-eval-save-inline-inp",
        attr: { type: "text", placeholder: "输入片段名称..." },
      }),
      w = b.createEl("button", {
        cls: "cli-eval-snippet-btn cli-eval-save-inline-confirm",
        text: "确认",
      });
    e = b.createEl("button", { cls: "cli-eval-snippet-btn", text: "取消" });
    let x = -1,
      _ = (e, t) => {
        ((x = e),
          (y.value = t),
          (y.placeholder = "修改片段名称..."),
          (w.textContent = "保存修改"),
          b.removeClass("is-hidden"),
          y.focus());
      },
      E = () => {
        ((x = -1),
          (y.value = ""),
          (y.placeholder = "输入片段名称..."),
          (w.textContent = "确认"),
          b.addClass("is-hidden"));
      },
      k = async () => {
        var e,
          t,
          a = y.value.trim();
        a
          ? (e = c.value.trim())
            ? ((t = this.plugin.settings.evalSnippets || []),
              0 <= x && x < t.length
                ? ((t[x] = { name: a, code: e }),
                  (this.plugin.settings.evalSnippets = t),
                  await this.plugin.saveSettings(),
                  new obsidian.Notice(`已更新片段「${a}」`))
                : (t.push({ name: a, code: e }),
                  (this.plugin.settings.evalSnippets = t),
                  await this.plugin.saveSettings(),
                  new obsidian.Notice(`已保存片段「${a}」`)),
              u(),
              E())
            : new obsidian.Notice("编辑器为空")
          : new obsidian.Notice("请输入片段名称");
      },
      S =
        (this._on(w, "click", k),
        this._on(e, "click", E),
        this._on(y, "keydown", (e) => {
          ("Enter" === e.key && k(), "Escape" === e.key && E());
        }),
        s.createDiv({ cls: "cli-eval-save-inline-wrap is-hidden" })),
      C = S.createEl("input", {
        cls: "cli-eval-save-inline-inp",
        attr: { type: "text", placeholder: "粘贴分享码 cli-eval-snippet:..." },
      });
    ((m = S.createEl("button", {
      cls: "cli-eval-snippet-btn cli-eval-save-inline-confirm",
      text: "导入",
    })),
      (r = S.createEl("button", {
        cls: "cli-eval-snippet-btn",
        text: "取消",
      })));
    let I = () => {
        ((C.value = ""), S.addClass("is-hidden"));
      },
      D = async () => {
        var e = C.value.trim(),
          a = "cli-eval-snippet:";
        if (e.startsWith(a)) {
          let t;
          try {
            t = JSON.parse(decodeURIComponent(escape(atob(e.slice(a.length)))));
          } catch (e) {
            return void new obsidian.Notice("分享码解析失败，请确认内容完整");
          }
          t && t.name && t.code
            ? ((e = this.plugin.settings.evalSnippets || []).find(
                (e) => e.name === t.name && e.code === t.code,
              )
                ? new obsidian.Notice(`片段「${t.name}」已存在`)
                : (e.push({ name: t.name, code: t.code }),
                  (this.plugin.settings.evalSnippets = e),
                  await this.plugin.saveSettings(),
                  u(),
                  new obsidian.Notice(`已导入片段「${t.name}」`)),
              I())
            : new obsidian.Notice("分享码内容不完整");
        } else
          new obsidian.Notice("分享码格式不正确，应以 cli-eval-snippet: 开头");
      };
    (this._on(m, "click", D),
      this._on(r, "click", I),
      this._on(C, "keydown", (e) => {
        ("Enter" === e.key && D(), "Escape" === e.key && I());
      }),
      this._on(l, "click", f),
      this._on(t, "click", () => {
        ((c.value = ""),
          (this.plugin.settings.evalLastCode = ""),
          this.plugin.saveSettings());
      }),
      this._on(a, "click", () => {
        (E(), S.removeClass("is-hidden"), C.focus());
      }),
      this._on(i, "click", () => {
        c.value.trim()
          ? (I(), E(), b.removeClass("is-hidden"), y.focus())
          : new obsidian.Notice("编辑器为空");
      }));
  }
