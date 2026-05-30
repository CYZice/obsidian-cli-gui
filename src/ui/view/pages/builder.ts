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

export function renderBuilder(e) {
    e = e.createDiv({ cls: "cli-builder" });
    this.selCmd ? this._renderCmdBuilder(e) : this._renderCmdList(e);
  }

export function renderCmdList(e) {
    var t = e
      .createDiv({ cls: "cli-search-wrap" })
      .createDiv({ cls: "cli-search-inner" });
    setIcon(t.createSpan({ cls: "cli-search-icon" }), "search");
    let a = t.createEl("input", {
        cls: "cli-search-input",
        attr: { type: "text", placeholder: "搜索命令..." },
      }),
      i =
        ((a.value = this.builderSearchQ),
        this._on(a, "input", () => {
          ((this.builderSearchQ = a.value), this._refreshCmdList(l));
        }),
        e.createDiv({ cls: "cli-cat-bar" })),
      s = i.createDiv({
        cls: "cli-cat-chip " + (this.selCat ? "" : "is-active"),
      }),
      l =
        (setIcon(s.createSpan({ cls: "cli-cat-chip-icon" }), "layout-grid"),
        s.createSpan({ text: "全部" }),
        this._on(s, "click", () => {
          ((this.selCat = null),
            (this.builderSearchQ = ""),
            (a.value = ""),
            i
              .querySelectorAll(".cli-cat-chip")
              .forEach((e) => e.removeClass("is-active")),
            s.addClass("is-active"),
            this._refreshCmdList(l));
        }),
        CLI_CATEGORIES.forEach((e) => {
          let t = i.createDiv({
            cls: "cli-cat-chip " + (this.selCat === e.id ? "is-active" : ""),
          });
          (setIcon(
            t.createSpan({ cls: "cli-cat-chip-icon" }),
            getCategoryIcon(e.id),
          ),
            t.createSpan({
              text: e.name.replace(/^[\p{Emoji}\s]+/u, "").trim(),
            }),
            this._on(t, "click", () => {
              ((this.selCat = e.id),
                (this.builderSearchQ = ""),
                (a.value = ""),
                i
                  .querySelectorAll(".cli-cat-chip")
                  .forEach((e) => e.removeClass("is-active")),
                t.addClass("is-active"),
                this._refreshCmdList(l));
            }));
        }),
        e.createDiv({ cls: "cli-cmd-list" }));
    this._refreshCmdList(l);
  }

export function refreshCmdList(t) {
    t.empty();
    let a = this.plugin.settings.favorites || [],
      i = this.builderSearchQ.toLowerCase().trim(),
      e = this.selCat
        ? CLI_COMMANDS.filter((e) => e.category === this.selCat)
        : CLI_COMMANDS;
    var s, l;
    (e = i
      ? e.filter(
          (e) =>
            e.name.toLowerCase().includes(i) ||
            e.desc.toLowerCase().includes(i) ||
            e.id.toLowerCase().includes(i),
        )
      : e).length
      ? ((s = e.filter((e) => a.includes(e.id))),
        (l = e.filter((e) => !a.includes(e.id))),
        s.length &&
          (t.createDiv({ cls: "cli-cmd-group-label", text: "★ 已收藏" }),
          s.forEach((e) => this._renderCmdItem(t, e, !0)),
          l.length) &&
          t.createDiv({ cls: "cli-cmd-group-label", text: "全部命令" }),
        l.forEach((e) => this._renderCmdItem(t, e, !1)))
      : t.createDiv({
          cls: "cli-empty",
          text: i ? "没有匹配的命令" : "请选择一个命令类别",
        });
  }

export function renderCmdItem(a, i, e) {
    this.plugin.settings.favorites;
    var t = a.createDiv({ cls: "cli-cmd-item " + (e ? "is-fav-item" : "") }),
      s = t.createDiv({ cls: "cli-cmd-item-info" }),
      l = s.createDiv({ cls: "cli-cmd-item-name-row" }),
      l =
        (e && setIcon(l.createSpan({ cls: "cli-cmd-fav-star" }), "star"),
        l.createSpan({ cls: "cli-cmd-item-name", text: i.name }),
        i.dangerous &&
          (setIcon(
            (l = l.createSpan({ cls: "cli-badge-danger" })).createSpan(),
            "alert-triangle",
          ),
          l.createSpan({ text: " 危险" })),
        s.createDiv({ cls: "cli-cmd-item-desc", text: i.desc }),
        s.createDiv({ cls: "cli-cmd-item-id", text: "obsidian " + i.id }),
        t.createDiv({ cls: "cli-cmd-item-right" }));
    let r = l.createDiv({
      cls: "cli-cmd-item-fav-btn " + (e ? "is-active" : ""),
      attr: { title: e ? "取消收藏" : "收藏" },
    });
    (setIcon(r, "star"),
      this._on(r, "click", async (e) => {
        e.stopPropagation();
        var e = this.plugin.settings.favorites,
          t = e.indexOf(i.id);
        (0 <= t ? e.splice(t, 1) : e.push(i.id),
          await this.plugin.saveSettings(),
          this._refreshCmdList(
            a.parentElement.querySelector(".cli-cmd-list") || a,
          ));
      }),
      setIcon(l.createDiv({ cls: "cli-cmd-item-arrow" }), "chevron-right"),
      this._on(t, "click", (e) => {
        r.contains(e.target) ||
          ((this.selCmd = i), (this.vals = {}), this.render());
      }));
  }

export function renderCmdBuilder(a) {
    let i = this.selCmd;
    var s = a
        .createDiv({ cls: "cli-builder-header" })
        .createDiv({ cls: "cli-back-btn" }),
      s =
        (setIcon(s, "arrow-left"),
        s.createSpan({ text: " 返回" }),
        this._on(s, "click", () => {
          ((this.selCmd = null), (this.vals = {}), this.render());
        }),
        a.createDiv({ cls: "cli-builder-title-area" })),
      s =
        (setIcon(
          s.createDiv({ cls: "cli-builder-icon" }),
          getCategoryIcon(i.category),
        ),
        s.createDiv({ cls: "cli-builder-title-info" }));
    if (
      (s.createEl("h3", { text: i.name, cls: "cli-builder-name" }),
      s.createDiv({ cls: "cli-builder-desc", text: i.desc }),
      i.params.length)
    ) {
      let t = a.createDiv({ cls: "cli-params-section" });
      (t.createEl("h4", { text: "参数设置", cls: "cli-params-title" }),
        i.params.forEach((e) => this._renderParam(t, e)));
      s = i.params.map((e) => e.name);
      let l = s.includes("ref"),
        r = s.includes("file"),
        n = s.includes("name"),
        c = s.includes("path"),
        o = s.includes("content"),
        p = s.includes("template");
      if (l || r || n || p) {
        let s = t.createDiv({ cls: "cli-param-conflict-warn" });
        ((s.style.display = "none"),
          (this._updateConflictWarning = () => {
            var e,
              t,
              a,
              i = [];
            (l &&
              (r || c) &&
              ((e = !(!this.vals.ref || !String(this.vals.ref).trim())),
              (t = !(!this.vals.file || !String(this.vals.file).trim())),
              (a = !(!this.vals.path || !String(this.vals.path).trim())),
              e) &&
              (t || a) &&
              i.push(
                "⚠️ 引用（ref）与文件名（file）/文件路径（path）同时填写时只能二选一，ref 优先生效，file/path 将被忽略。",
              ),
              r &&
                c &&
                ((e = !(!this.vals.file || !String(this.vals.file).trim())),
                (t = !(!this.vals.path || !String(this.vals.path).trim())),
                e) &&
                t &&
                i.push(
                  "⚠️ 文件名（file）与文件路径（path）同时填写时只能二选一，path 优先生效，file 将被忽略。",
                ),
              n &&
                c &&
                ((a = !(!this.vals.name || !String(this.vals.name).trim())),
                (e = !(!this.vals.path || !String(this.vals.path).trim())),
                a) &&
                e &&
                i.push(
                  "⚠️ 文件名（name）与完整路径（path）同时填写时只能二选一，path 优先生效，name 将被忽略。",
                ),
              o &&
                p &&
                ((t = !(
                  !this.vals.content || !String(this.vals.content).trim()
                )),
                (a = !(
                  !this.vals.template || !String(this.vals.template).trim()
                )),
                t) &&
                a &&
                i.push(
                  '⚠️ template 与 content 同时填写时，模板内容会覆盖 content，content 将不会写入文件，请使用"序列"功能追加内容。',
                ),
              i.length
                ? ((s.style.display = ""),
                  (s.innerHTML = i.map((e) => `<div>${e}</div>`).join("")))
                : ((s.style.display = "none"), (s.innerHTML = "")));
          }));
      }
    }
    if (this.plugin.settings.showCommandPreview) {
      var s = a.createDiv({ cls: "cli-preview-section" }),
        t =
          (s.createEl("h4", { text: "命令预览", cls: "cli-preview-title" }),
          s.createDiv({ cls: "cli-preview-box" }));
      this._previewCode = t.createEl("code", {
        text: buildCommandString(i, this.vals),
        cls: "cli-preview-code",
      });
      let e = s.createDiv({ cls: "cli-copy-btn" });
      (setIcon(e, "clipboard"),
        e.createSpan({ text: " 复制命令" }),
        this._on(e, "click", () => {
          (navigator.clipboard.writeText(this._previewCode.textContent),
            e.empty(),
            setIcon(e, "check"),
            e.createSpan({ text: " 已复制" }),
            setTimeout(() => {
              (e.empty(),
                setIcon(e, "clipboard"),
                e.createSpan({ text: " 复制命令" }));
            }, 1500));
        }));
    }
    ((t = a.createDiv({ cls: "cli-builder-actions" })),
      (s = t.createEl("button", {
        cls: "cli-btn-exec " + (i.dangerous ? "is-danger" : ""),
      })),
      setIcon(s, i.dangerous ? "alert-triangle" : "play"),
      s.createSpan({ text: i.dangerous ? " 执行（危险操作）" : " 执行命令" }),
      this._on(s, "click", () => this._exec(i)),
      (a = t.createEl("button", { cls: "cli-btn-save" })));
    (setIcon(a, "save"),
      a.createSpan({ text: " 保存为预设" }),
      this._on(a, "click", () => this._savePreset(i)));
    let l = () => {
        var e = this.plugin.settings.favorites.includes(i.id);
        ((r.className = "cli-btn-fav " + (e ? "is-fav" : "")),
          r.empty(),
          setIcon(r, "star"),
          r.createSpan({ text: e ? " 已收藏" : " 收藏" }));
      },
      r = t.createEl("button", { cls: "" });
    (l(),
      this._on(r, "click", async () => {
        var e = this.plugin.settings.favorites,
          t = e.indexOf(i.id);
        (0 <= t ? e.splice(t, 1) : e.push(i.id),
          await this.plugin.saveSettings(),
          l());
      }));
  }

export function renderParam(i, s) {
    var i = i.createDiv({ cls: "cli-param-field" }),
      e = i.createDiv({ cls: "cli-param-label-row" });
    (e.createSpan({ cls: "cli-param-label", text: s.label }),
      s.required && e.createSpan({ cls: "cli-param-required", text: "必填" }));
    let l = () => {
      (this._previewCode &&
        this.selCmd &&
        (this._previewCode.textContent = buildCommandString(
          this.selCmd,
          this.vals,
        )),
        this._updateConflictWarning && this._updateConflictWarning());
    };
    if ("text" === s.type || "number" === s.type) {
      let t = i.createEl("input", {
        cls: "cli-param-input",
        attr: {
          type: "number" === s.type ? "number" : "text",
          placeholder: s.placeholder || "",
          value: this.vals[s.name] || "",
        },
      });
      this._on(t, "input", () => {
        ((this.vals[s.name] = t.value), l());
      });
      var e = s.name.toLowerCase(),
        a =
          "path" === s.name &&
          this.selCmd &&
          ["search", "search:context"].includes(this.selCmd.id),
        r = this.selCmd && "template:insert" === this.selCmd.id;
      (("template" === s.name || (r && "name" === s.name)) &&
        this._attachTemplatePicker(t, (e) => {
          ((this.vals[s.name] = e), (t.value = e), l());
        }),
        "file" === s.name &&
          ((r = this.selCmd && "bookmark" === this.selCmd.id ? "path" : "name"),
          this._attachFilePicker(t, r, (e) => {
            ((this.vals[s.name] = e), (t.value = e), l());
          })),
        "to" === s.name
          ? this._attachFolderPicker(t, (e) => {
              ((this.vals[s.name] = e), (t.value = e), l());
            })
          : "subpath" === s.name && this.selCmd && "bookmark" === this.selCmd.id
            ? this._attachSubpathPicker(t, (e) => {
                ((this.vals[s.name] = e), (t.value = e), l());
              })
            : e.includes("path")
              ? a
                ? this._attachFolderPicker(t, (e) => {
                    ((this.vals[s.name] = e), (t.value = e), l());
                  })
                : this._attachFilePicker(t, "path", (e) => {
                    ((this.vals[s.name] = e), (t.value = e), l());
                  })
              : e.includes("folder") &&
                this._attachFolderPicker(t, (e) => {
                  ((this.vals[s.name] = e), (t.value = e), l());
                }));
    } else if ("textarea" === s.type) {
      let e = i.createEl("textarea", {
        cls: "cli-param-textarea",
        attr: { placeholder: s.placeholder || "", rows: 3 },
      });
      ((e.value = this.vals[s.name] || ""),
        this._on(e, "input", () => {
          ((this.vals[s.name] = e.value), l());
        }));
    } else if ("select" === s.type) {
      let a = i.createEl("select", { cls: "cli-param-select" });
      (a.createEl("option", { text: "-- 不指定 --", attr: { value: "" } }),
        s.options.forEach((e) => {
          var t = a.createEl("option", { text: e, attr: { value: e } });
          this.vals[s.name] === e && (t.selected = !0);
        }),
        this._on(a, "change", () => {
          ((this.vals[s.name] = a.value), l());
        }));
    } else if ("flag" === s.type) {
      r = i.createDiv({ cls: "cli-param-toggle" });
      let e = r.createEl("input", { attr: { type: "checkbox" } });
      ((e.checked = !!this.vals[s.name]),
        r.createSpan({ text: s.label, cls: "cli-param-toggle-label" }),
        this._on(e, "change", () => {
          ((this.vals[s.name] = e.checked), l());
        }));
    }
    i.createDiv({ cls: "cli-param-hint", text: "参数: " + s.name });
  }

export function attachFilePicker(r, n, c) {
    let o = null,
      p = () => {
        o && (o.remove(), (o = null));
      },
      t = () => {
        if (!o) {
          let l = this.app.vault.getFiles();
          if (l.length) {
            (((o = document.createElement("div")).className =
              "cli-template-picker cli-file-picker"),
              document.body.appendChild(o));
            let e = document.createElement("input"),
              s =
                ((e.className = "cli-template-picker-search"),
                (e.placeholder =
                  "path" === n ? "搜索文件路径..." : "搜索文件名..."),
                (e.type = "text"),
                o.appendChild(e),
                document.createElement("div")),
              t =
                ((s.className = "cli-template-picker-list"),
                o.appendChild(s),
                (e) => {
                  s.innerHTML = "";
                  let a = e.toLowerCase(),
                    i = r.value.toLowerCase();
                  var e = l
                    .filter((e) => {
                      var e = "path" === n ? e.path : e.basename,
                        t = a || i;
                      return !t || e.toLowerCase().includes(t);
                    })
                    .sort((e, t) => {
                      ((e = "path" === n ? e.path : e.basename),
                        (t = "path" === n ? t.path : t.basename));
                      return e.localeCompare(t);
                    })
                    .slice(0, 80);
                  e.length
                    ? e.forEach((e) => {
                        var t = document.createElement("div");
                        t.className =
                          "cli-template-picker-item cli-file-picker-item";
                        let a = "path" === n ? e.path : e.basename;
                        var i = document.createElement("span");
                        ((i.className = "cli-file-picker-name"),
                          (i.textContent = e.basename),
                          t.appendChild(i),
                          ("path" !== n && !e.parent?.path) ||
                            (((i = document.createElement("span")).className =
                              "cli-file-picker-path"),
                            (i.textContent = e.parent?.path || ""),
                            t.appendChild(i)),
                          (t.title = e.path),
                          t.addEventListener("mousedown", (e) => {
                            (e.preventDefault(),
                              (r.value = a),
                              c ? c(a) : r.dispatchEvent(new Event("input")),
                              p(),
                              r.focus());
                          }),
                          s.appendChild(t));
                      })
                    : (((e = document.createElement("div")).className =
                        "cli-template-picker-empty"),
                      (e.textContent = "无匹配文件"),
                      s.appendChild(e));
                });
            t(r.value);
            var i;
            ((i = r.getBoundingClientRect()),
              (o.style.top = i.bottom + 2 + "px"),
              (o.style.left = i.left + "px"),
              (o.style.width = Math.max(i.width, 260) + "px"),
              e.addEventListener("input", () => t(e.value)),
              e.addEventListener("keydown", (e) => {
                "Escape" === e.key && (p(), r.focus());
              }),
              setTimeout(() => e.focus(), 0));
            let a = (e) => {
              !o ||
                o.contains(e.target) ||
                e.target === r ||
                (p(), document.removeEventListener("mousedown", a));
            };
            document.addEventListener("mousedown", a);
          }
        }
      };
    (this._on(r, "focus", t),
      this._on(r, "input", () => {
        if (o) {
          let s = o.querySelector(".cli-template-picker-list");
          var e = o.querySelector(".cli-template-picker-search");
          if (s && e) {
            e.value = r.value;
            e = this.app.vault.getFiles();
            s.innerHTML = "";
            let t = r.value.toLowerCase();
            var e = e
              .filter((e) => {
                e = "path" === n ? e.path : e.basename;
                return !t || e.toLowerCase().includes(t);
              })
              .sort((e, t) => {
                ((e = "path" === n ? e.path : e.basename),
                  (t = "path" === n ? t.path : t.basename));
                return e.localeCompare(t);
              })
              .slice(0, 80);
            e.length
              ? e.forEach((e) => {
                  var t = document.createElement("div");
                  t.className = "cli-template-picker-item cli-file-picker-item";
                  let a = "path" === n ? e.path : e.basename;
                  var i = document.createElement("span");
                  ((i.className = "cli-file-picker-name"),
                    (i.textContent = e.basename),
                    t.appendChild(i),
                    e.parent?.path &&
                      (((i = document.createElement("span")).className =
                        "cli-file-picker-path"),
                      (i.textContent = e.parent.path),
                      t.appendChild(i)),
                    (t.title = e.path),
                    t.addEventListener("mousedown", (e) => {
                      (e.preventDefault(),
                        (r.value = a),
                        c ? c(a) : r.dispatchEvent(new Event("input")),
                        p(),
                        r.focus());
                    }),
                    s.appendChild(t));
                })
              : (((e = document.createElement("div")).className =
                  "cli-template-picker-empty"),
                (e.textContent = "无匹配文件"),
                s.appendChild(e));
          }
        } else r.value && t();
      }),
      this._on(r, "blur", () => {
        setTimeout(() => {
          o && !o.matches(":focus-within") && p();
        }, 150);
      }));
  }

export function attachSubpathPicker(i, s) {
    let l = null,
      r = [],
      n = "",
      a = this.app.vault,
      c = () => `${this.vals?.path || ""}|` + (this.vals?.file || ""),
      o = () => {
        var e = (this.vals?.path || "").trim();
        if (e) {
          e = a.getAbstractFileByPath(e);
          if (e instanceof obsidian.TFile && "md" === e.extension) return e;
        }
        let t = (this.vals?.file || "").trim();
        if (t) {
          e = a.getAbstractFileByPath(t);
          if (e instanceof obsidian.TFile && "md" === e.extension) return e;
          e = a
            .getMarkdownFiles()
            .find((e) => e.path === t || e.basename === t || e.name === t);
          if (e) return e;
        }
        return null;
      },
      p = async () => {
        var e = o();
        if (!e)
          return { error: "请先在“文件”或“路径”参数中选择一个 Markdown 文件" };
        let i = this.app.metadataCache.getFileCache(e);
        if (!i) return { error: "暂未获取到该文件的索引，稍后再试" };
        let s = [];
        i.headings?.length &&
          i.headings.forEach((e) => {
            e.heading &&
              s.push({
                label: "# " + e.heading,
                value: "#" + e.heading,
                type: "heading",
                order: e.position?.start?.line ?? 0,
              });
          });
        var t = i.blocks ? Object.keys(i.blocks) : [];
        let l = null;
        return (
          t.length && (l = await this.app.vault.cachedRead(e)),
          t.forEach((e) => {
            var t = i.blocks[e];
            let a = "";
            (l &&
              t?.position &&
              (a =
                l
                  .slice(t.position.start.offset, t.position.end.offset)
                  .split("\n")
                  .map((e) => e.trim())
                  .find(Boolean) || ""),
              s.push({
                label: a ? `^${e} · ` + a : "^" + e,
                value: "^" + e,
                type: "block",
                order: t?.position?.start?.line ?? 0,
              }));
          }),
          s.length
            ? (s.sort((e, t) => (e.order ?? 0) - (t.order ?? 0)),
              { entries: s, filePath: e.path })
            : { error: "该文件暂无可用的标题或块" }
        );
      },
      d = () => {
        l && (l.remove(), (l = null));
      },
      u = (e) => {
        if (l) {
          let a = l.querySelector(".cli-template-picker-list");
          if (a) {
            a.innerHTML = "";
            let t = e.toLowerCase();
            var e = r
              .filter(
                (e) =>
                  e.label.toLowerCase().includes(t) ||
                  e.value.toLowerCase().includes(t),
              )
              .slice(0, 80);
            e.length
              ? e.forEach((t) => {
                  var e = document.createElement("div");
                  ((e.className =
                    "cli-template-picker-item cli-subpath-picker-item"),
                    (e.textContent = t.label),
                    (e.title = t.value),
                    e.addEventListener("mousedown", (e) => {
                      (e.preventDefault(),
                        (i.value = t.value),
                        s ? s(t.value) : i.dispatchEvent(new Event("input")),
                        d(),
                        i.focus());
                    }),
                    a.appendChild(e));
                })
              : (((e = document.createElement("div")).className =
                  "cli-template-picker-empty"),
                (e.textContent = "无匹配结果"),
                a.appendChild(e));
          }
        }
      },
      m = async () => {
        var e, t, a;
        l &&
          ((e = l.querySelector(".cli-template-picker-list")) &&
            ((e.innerHTML = ""),
            ((t = document.createElement("div")).className =
              "cli-template-picker-empty"),
            (t.textContent = "加载中..."),
            e.appendChild(t)),
          (t = await p()),
          (a = c()),
          (n = a),
          t.error
            ? (e &&
                ((e.innerHTML = ""),
                ((a = document.createElement("div")).className =
                  "cli-template-picker-empty"),
                (a.textContent = t.error),
                e.appendChild(a)),
              (r = []))
            : ((r = t.entries), u(i.value || "")));
      };
    (this._on(i, "focus", () => {
      (() => {
        if (!l) {
          (((l = document.createElement("div")).className =
            "cli-template-picker cli-subpath-picker"),
            document.body.appendChild(l));
          let e = document.createElement("input");
          ((e.className = "cli-template-picker-search"),
            (e.placeholder = "搜索标题或块..."),
            (e.type = "text"),
            l.appendChild(e));
          var a = document.createElement("div");
          ((a.className = "cli-template-picker-list"), l.appendChild(a));
          ((a = i.getBoundingClientRect()),
            (l.style.top = a.bottom + 2 + "px"),
            (l.style.left = a.left + "px"),
            (l.style.width = Math.max(a.width, 280) + "px"),
            e.addEventListener("input", () => u(e.value)),
            e.addEventListener("keydown", (e) => {
              "Escape" === e.key && (d(), i.focus());
            }),
            setTimeout(() => e.focus(), 0));
          let t = (e) => {
            !l ||
              l.contains(e.target) ||
              e.target === i ||
              (d(), document.removeEventListener("mousedown", t));
          };
          (document.addEventListener("mousedown", t), m());
        }
      })();
    }),
      this._on(i, "input", () => {
        l && (c() !== n ? m() : u(i.value));
      }),
      this._on(i, "blur", () => {
        setTimeout(() => {
          l && !l.matches(":focus-within") && d();
        }, 150);
      }));
  }

export function attachFolderPicker(r, n) {
    let c = null,
      a = () => {
        let a = [],
          i = (e) => {
            var t = e.path || "";
            (a.push(t),
              e.children?.forEach((e) => {
                e instanceof obsidian.TFolder && i(e);
              }));
          };
        return (i(this.app.vault.getRoot()), a);
      },
      o = () => {
        c && (c.remove(), (c = null));
      },
      t = () => {
        if (!c) {
          let l = a();
          if (l.length) {
            (((c = document.createElement("div")).className =
              "cli-template-picker cli-folder-picker"),
              document.body.appendChild(c));
            let e = document.createElement("input"),
              s =
                ((e.className = "cli-template-picker-search"),
                (e.placeholder = "搜索文件夹..."),
                (e.type = "text"),
                c.appendChild(e),
                document.createElement("div")),
              t =
                ((s.className = "cli-template-picker-list"),
                c.appendChild(s),
                (e) => {
                  s.innerHTML = "";
                  let a = e.toLowerCase(),
                    i = r.value.toLowerCase();
                  var e = l
                    .filter((e) => {
                      var t = a || i;
                      return !t || (e || "/").toLowerCase().includes(t);
                    })
                    .sort((e, t) => (e || "").localeCompare(t || ""))
                    .slice(0, 80);
                  e.length
                    ? e.forEach((e) => {
                        var t = document.createElement("div");
                        t.className =
                          "cli-template-picker-item cli-folder-picker-item";
                        let a = e || "/";
                        ((t.textContent = a),
                          (t.title = a),
                          t.addEventListener("mousedown", (e) => {
                            (e.preventDefault(),
                              (r.value = a),
                              n ? n(a) : r.dispatchEvent(new Event("input")),
                              o(),
                              r.focus());
                          }),
                          s.appendChild(t));
                      })
                    : (((e = document.createElement("div")).className =
                        "cli-template-picker-empty"),
                      (e.textContent = "无匹配文件夹"),
                      s.appendChild(e));
                });
            t(r.value);
            var i;
            ((i = r.getBoundingClientRect()),
              (c.style.top = i.bottom + 2 + "px"),
              (c.style.left = i.left + "px"),
              (c.style.width = Math.max(i.width, 240) + "px"),
              e.addEventListener("input", () => t(e.value)),
              e.addEventListener("keydown", (e) => {
                "Escape" === e.key && (o(), r.focus());
              }),
              setTimeout(() => e.focus(), 0));
            let a = (e) => {
              !c ||
                c.contains(e.target) ||
                e.target === r ||
                (o(), document.removeEventListener("mousedown", a));
            };
            document.addEventListener("mousedown", a);
          }
        }
      };
    (this._on(r, "focus", t),
      this._on(r, "input", () => {
        if (!c && r.value) t();
        else if (c) {
          let i = c.querySelector(".cli-template-picker-list");
          var e = c.querySelector(".cli-template-picker-search");
          if (i && e) {
            e.value = r.value;
            e = a();
            i.innerHTML = "";
            let t = r.value.toLowerCase();
            var e = e
              .filter((e) => !t || (e || "/").toLowerCase().includes(t))
              .sort((e, t) => (e || "").localeCompare(t || ""))
              .slice(0, 80);
            e.length
              ? e.forEach((e) => {
                  var t = document.createElement("div");
                  t.className =
                    "cli-template-picker-item cli-folder-picker-item";
                  let a = e || "/";
                  ((t.textContent = a),
                    (t.title = a),
                    t.addEventListener("mousedown", (e) => {
                      (e.preventDefault(),
                        (r.value = a),
                        n ? n(a) : r.dispatchEvent(new Event("input")),
                        o(),
                        r.focus());
                    }),
                    i.appendChild(t));
                })
              : (((e = document.createElement("div")).className =
                  "cli-template-picker-empty"),
                (e.textContent = "无匹配文件夹"),
                i.appendChild(e));
          }
        }
      }),
      this._on(r, "blur", () => {
        setTimeout(() => {
          c && !c.matches(":focus-within") && o();
        }, 150);
      }));
  }

export function getTemplateFolder() {
    return (
      this.app.internalPlugins?.getPluginById("templates")?.instance?.options
        ?.folder || null
    );
  }

export function getTemplateFiles() {
    var e = this._getTemplateFolder();
    if (!e) return [];
    let t = e.replace(/\/$/, "") + "/";
    return this.app.vault
      .getFiles()
      .filter((e) => "md" === e.extension && e.path.startsWith(t))
      .map((e) => e.path.replace(/\.md$/, "").slice(t.length));
  }

export function attachTemplatePicker(r, n) {
    let c = null,
      o = () => {
        c && (c.remove(), (c = null));
      };
    (this._on(r, "focus", () => {
      if (!c) {
        let s = this._getTemplateFiles();
        if (s.length) {
          (((c = document.createElement("div")).className =
            "cli-template-picker"),
            document.body.appendChild(c));
          let e = document.createElement("input"),
            a =
              ((e.className = "cli-template-picker-search"),
              (e.placeholder = "搜索模板..."),
              (e.type = "text"),
              c.appendChild(e),
              document.createElement("div")),
            t =
              ((a.className = "cli-template-picker-list"),
              c.appendChild(a),
              (e) => {
                a.innerHTML = "";
                let t = e.toLowerCase();
                var e = t ? s.filter((e) => e.toLowerCase().includes(t)) : s;
                e.length
                  ? e.forEach((t) => {
                      var e = document.createElement("div");
                      ((e.className = "cli-template-picker-item"),
                        (e.textContent = t),
                        (e.title = t),
                        e.addEventListener("mousedown", (e) => {
                          (e.preventDefault(),
                            (r.value = t),
                            n ? n(t) : r.dispatchEvent(new Event("input")),
                            o(),
                            r.focus());
                        }),
                        a.appendChild(e));
                    })
                  : (((e = document.createElement("div")).className =
                      "cli-template-picker-empty"),
                    (e.textContent = "无匹配模板"),
                    a.appendChild(e));
              });
          t("");
          var l;
          ((l = r.getBoundingClientRect()),
            (c.style.top = l.bottom + 2 + "px"),
            (c.style.left = l.left + "px"),
            (c.style.width = Math.max(l.width, 240) + "px"),
            e.addEventListener("input", () => t(e.value)),
            e.addEventListener("keydown", (e) => {
              "Escape" === e.key && (o(), r.focus());
            }),
            setTimeout(() => e.focus(), 0));
          let i = (e) => {
            !c ||
              c.contains(e.target) ||
              e.target === r ||
              (o(), document.removeEventListener("mousedown", i));
          };
          document.addEventListener("mousedown", i);
        }
      }
    }),
      this._on(r, "blur", () => {
        setTimeout(() => {
          c && !c.matches(":focus-within") && o();
        }, 150);
      }));
  }

export async function exec(t) {
    if (
      t.dangerous &&
      this.plugin.settings.confirmDangerous &&
      !(await new Promise((e) =>
        new ConfirmModal(
          this.app,
          "危险操作确认",
          `即将执行: ${t.name}

${buildCommandString(t, this.vals)}

此操作可能不可逆，确定执行吗？`,
          e,
        ).open(),
      ))
    )
      return;
    var a = t.params.filter((e) => e.required && !this.vals[e.name]);
    if (a.length)
      new obsidian.Notice(
        "请填写必填参数: " + a.map((e) => e.label).join(", "),
        4e3,
      );
    else {
      var e,
        a = buildCommandString(t, this.vals);
      this._resultPanel &&
        (this._resultPanel.empty(),
        this._resultPanel.removeClass("is-hidden"),
        setIcon(
          (e = this._resultPanel.createDiv({ cls: "cli-result-loading" })),
          "loader",
        ),
        e.createSpan({ text: " 执行中..." }));
      try {
        var i = await this.plugin.executeCLI(a);
        (this._showResult(i, !1), this._addHistory(a, t, i, !0));
      } catch (e) {
        (this._showResult(e.message, !0),
          this._addHistory(a, t, e.message, !1));
      }
    }
  }
