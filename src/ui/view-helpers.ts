// @ts-nocheck
const obsidian = require("obsidian");
const { CLI_COMMANDS } = require("../shared/constants/commands");
const { buildCommandString } = require("../domain/commands/builder");
const { formatTime } = require("./components/common/datetime");
const { setIcon } = require("./components/common/icon");
const { ConfirmModal } = require("./components/modals/ConfirmModal");
const { SavePresetModal } = require("./components/modals/SavePresetModal");

export function renderNav(e) {
    let a = e.createDiv({ cls: "cli-nav" });
    [
      { id: "home", label: "首页", icon: "home" },
      { id: "builder", label: "构建", icon: "zap" },
      { id: "eval", label: "脚本", icon: "code-2" },
      { id: "presets", label: "预设", icon: "star" },
      { id: "workflows", label: "序列", icon: "git-branch" },
      { id: "history", label: "历史", icon: "clock" },
    ].forEach((e) => {
      var t = a.createDiv({
        cls: "cli-nav-tab " + (this.page === e.id ? "is-active" : ""),
      });
      (setIcon(t.createSpan({ cls: "cli-nav-icon" }), e.icon),
        t.createSpan({ cls: "cli-nav-label", text: e.label }),
        this._on(t, "click", () => {
          ((this.page = e.id), this.render());
        }));
    });
  }

export function showResult(e, t) {
    let a = this._resultPanel;
    var i, s;
    a &&
      (this.plugin.settings.showResultPanel
        ? (a.empty(),
          a.removeClass("is-hidden"),
          a.removeClass("cli-result-panel-animate"),
          a.offsetHeight,
          a.addClass("cli-result-panel-animate"),
          (i = a.createDiv({ cls: "cli-result-panel-header" })).createSpan({
            cls: "cli-result-panel-title",
            text: "执行结果",
          }),
          setIcon(
            (s = i.createDiv({ cls: "cli-result-panel-status" })).createSpan({
              cls: t ? "cli-result-error" : "cli-result-success",
            }),
            t ? "x-circle" : "check-circle",
          ),
          s.createSpan({
            text: " ",
            cls: t ? "cli-result-error" : "cli-result-success",
          }),
          setIcon(
            (s = i.createDiv({
              cls: "cli-result-panel-close",
              attr: { title: "复制结果" },
            })),
            "copy",
          ),
          this._on(s, "click", () => {
            (navigator.clipboard.writeText(e), new obsidian.Notice("已复制"));
          }),
          setIcon((t = i.createDiv({ cls: "cli-result-panel-close" })), "x"),
          this._on(t, "click", () => {
            (a.empty(), a.addClass("is-hidden"));
          }),
          (s = a.createDiv({ cls: "cli-result-panel-body" })),
          this._renderResultContent(s, e))
        : (a.empty(), a.addClass("is-hidden")));
  }

export function renderResultContent(e, t) {
    if (t && t.trim()) {
      var a = t.trim();
      if (a.startsWith("[") || a.startsWith("{"))
        try {
          var i = JSON.parse(a);
          if (Array.isArray(i) && 0 < i.length)
            return void this._renderJsonTable(e, i);
          if (i && "object" == typeof i && !Array.isArray(i))
            return void this._renderJsonKV(e, i);
        } catch (e) {}
    }
    e.createEl("pre", { cls: "cli-result-pre" }).createEl("code", {
      cls: "cli-result-code",
      text: t && t.trim() ? t : "(无输出)",
    });
  }

export function renderJsonTable(c, o) {
    let p = [];
    if (
      (o.forEach((e) => {
        e &&
          "object" == typeof e &&
          Object.keys(e).forEach((e) => {
            p.includes(e) || p.push(e);
          });
      }),
      p.length)
    ) {
      var d = c.createDiv({ cls: "cli-json-table-wrap" }),
        u = d.createDiv({ cls: "cli-json-table-meta" });
      u.createSpan({ cls: "cli-json-table-count", text: o.length + " 条记录" });
      let e = u.createEl("button", {
          cls: "cli-json-table-raw-btn",
          text: "查看原始 JSON",
        }),
        t = !1,
        a = d.createEl("pre", { cls: "cli-result-pre cli-json-raw-pre" });
      (a.createEl("code", {
        cls: "cli-result-code",
        text: JSON.stringify(o, null, 2),
      }),
        (a.style.display = "none"),
        this._on(e, "click", () => {
          ((t = !t),
            (a.style.display = t ? "" : "none"),
            (e.textContent = t ? "隐藏原始 JSON" : "查看原始 JSON"));
        }));
      u = d
        .createDiv({ cls: "cli-json-table-scroll" })
        .createEl("table", { cls: "cli-json-table" });
      let i = u.createEl("thead").createEl("tr"),
        l = null,
        r = !0,
        s = u.createEl("tbody"),
        n = () => {
          s.empty();
          var e = [...o];
          (null !== l &&
            e.sort((e, t) => {
              var e = e?.[l] ?? "",
                t = t?.[l] ?? "",
                a = Number(e),
                i = Number(t);
              let s;
              return (
                (s =
                  isNaN(a) || isNaN(i)
                    ? String(e).localeCompare(String(t), void 0, {
                        numeric: !0,
                      })
                    : a - i),
                r ? s : -s
              );
            }),
            e.forEach((a) => {
              let i = s.createEl("tr", { cls: "cli-json-table-row" });
              p.forEach((e) => {
                var e = a?.[e],
                  t = i.createEl("td", { cls: "cli-json-table-td" });
                null == e
                  ? t.createSpan({ cls: "cli-json-null", text: "—" })
                  : "boolean" == typeof e
                    ? setIcon(
                        t.createSpan({
                          cls: e ? "cli-json-bool-true" : "cli-json-bool-false",
                        }),
                        e ? "check" : "x",
                      )
                    : "object" == typeof e
                      ? t.createEl("code", {
                          cls: "cli-json-nested",
                          text: JSON.stringify(e),
                        })
                      : 80 < (e = String(e)).length
                        ? t.createSpan({
                            cls: "cli-json-long",
                            text: e.slice(0, 80) + "…",
                            attr: { title: e },
                          })
                        : t.createSpan({ text: e });
              });
            }));
        };
      (p.forEach((e) => {
        let t = i.createEl("th", { cls: "cli-json-table-th" });
        var a = t.createDiv({ cls: "cli-json-th-inner" }),
          a =
            (a.createSpan({ text: e }),
            a.createSpan({ cls: "cli-json-sort-icon" }));
        (setIcon(a, "chevrons-up-down"),
          this._on(t, "click", () => {
            ((r = l === e ? !r : ((l = e), !0)),
              i
                .querySelectorAll(".cli-json-table-th")
                .forEach((e) => e.removeClass("is-sort-asc", "is-sort-desc")),
              t.addClass(r ? "is-sort-asc" : "is-sort-desc"),
              n());
          }));
      }),
        n(),
        d.appendChild(a));
    } else
      c.createEl("pre", { cls: "cli-result-pre" }).createEl("code", {
        cls: "cli-result-code",
        text: JSON.stringify(o, null, 2),
      });
  }

export function renderJsonKV(e, t) {
    var e = e.createDiv({ cls: "cli-json-table-wrap" }),
      a = e.createDiv({ cls: "cli-json-table-meta" });
    a.createSpan({
      cls: "cli-json-table-count",
      text: Object.keys(t).length + " 个字段",
    });
    let i = a.createEl("button", {
        cls: "cli-json-table-raw-btn",
        text: "查看原始 JSON",
      }),
      s = !1,
      l = e.createEl("pre", { cls: "cli-result-pre cli-json-raw-pre" }),
      r =
        (l.createEl("code", {
          cls: "cli-result-code",
          text: JSON.stringify(t, null, 2),
        }),
        (l.style.display = "none"),
        this._on(i, "click", () => {
          ((s = !s),
            (l.style.display = s ? "" : "none"),
            (i.textContent = s ? "隐藏原始 JSON" : "查看原始 JSON"));
        }),
        e
          .createDiv({ cls: "cli-json-table-scroll" })
          .createEl("table", { cls: "cli-json-table cli-json-kv-table" })
          .createEl("tbody"));
    (Object.entries(t).forEach(([e, t]) => {
      var a = r.createEl("tr", { cls: "cli-json-table-row" }),
        e =
          (a.createEl("td", {
            cls: "cli-json-table-td cli-json-kv-key",
            text: e,
          }),
          a.createEl("td", { cls: "cli-json-table-td" }));
      null == t
        ? e.createSpan({ cls: "cli-json-null", text: "—" })
        : "boolean" == typeof t
          ? setIcon(
              e.createSpan({
                cls: t ? "cli-json-bool-true" : "cli-json-bool-false",
              }),
              t ? "check" : "x",
            )
          : "object" == typeof t
            ? e.createEl("code", {
                cls: "cli-json-nested",
                text: JSON.stringify(t),
              })
            : e.createSpan({ text: String(t) });
    }),
      e.appendChild(l));
  }

export function confirmDanger(t, a) {
    if ("true" === t.dataset.confirming) return;
    t.dataset.confirming = "true";
    let e = t.innerHTML;
    (t.empty(),
      setIcon(t.createSpan(), "alert-triangle"),
      t.createSpan({ text: " 确认？" }),
      (t.style.color = "var(--text-error)"));
    let i = () => {
        ((t.dataset.confirming = ""),
          (t.innerHTML = e),
          (t.style.color = ""),
          document.removeEventListener("click", s));
      },
      s = (e) => {
        t.contains(e.target) || i();
      },
      l =
        (setTimeout(() => document.addEventListener("click", s), 0),
        (e) => {
          (e.stopPropagation(),
            t.removeEventListener("click", l),
            document.removeEventListener("click", s),
            (t.dataset.confirming = ""),
            a());
        });
    t.addEventListener("click", l);
  }

export async function addHistory(e, t, a, i, s) {
    var l = this.plugin.settings.executionHistory,
      e = {
        command: e,
        commandId: t.id,
        commandName: t.name,
        params: { ...this.vals },
        result: String(a).substring(0, 500),
        timestamp: Date.now(),
        success: i,
      };
    (s && (e.workflow = JSON.parse(JSON.stringify(s))),
      l.unshift(e),
      l.length > this.plugin.settings.maxHistory && l.pop(),
      await this.plugin.saveSettings());
  }

export function savePreset(e) {
    new SavePresetModal(this.app, e, this.vals, async (e) => {
      (this.plugin.settings.userPresets.push(e),
        await this.plugin.saveSettings(),
        new obsidian.Notice("✅ 预设已保存"),
        (this.page = "presets"),
        this.render());
    }).open();
  }
