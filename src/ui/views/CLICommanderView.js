const obsidian = require("obsidian");

const VIEW_TYPE = "cli-commander-view";

/**
 * CLI Commander 主视图
 */
class CLICommanderView extends obsidian.ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.page = "home";
    this.selCat = null;
    this.selCmd = null;
    this.vals = {};
    this.searchQ = "";
    this.builderSearchQ = "";
    this.presetSearchQ = "";
    this.wfEditor = null;
    this._cleanups = [];
  }

  getViewType() {
    return VIEW_TYPE;
  }

  getDisplayText() {
    return "CLI Commander";
  }

  getIcon() {
    return "waypoints";
  }

  async onOpen() {
    this.containerEl.empty();
    this.containerEl.addClass("cli-commander-container");
    this.render();
  }

  async onClose() {
    this._clean();
    this.containerEl.empty();
  }

  _clean() {
    this._cleanups.forEach((fn) => fn());
    this._cleanups = [];
  }

  _on(el, event, handler) {
    el.addEventListener(event, handler);
    this._cleanups.push(() => el.removeEventListener(event, handler));
  }

  render() {
    this._clean();
    this.containerEl.empty();
    var root = this.containerEl.createDiv({ cls: "cli-root" });
    this._renderNav(root);
    this._resultPanel = root.createDiv({
      cls: "cli-result-panel is-hidden",
    });
    var content = root.createDiv({ cls: "cli-content" });

    switch (this.page) {
      case "home":
        this._renderHome(content);
        break;
      case "builder":
        this._renderBuilder(content);
        break;
      case "presets":
        this._renderPresets(content);
        break;
      case "workflows":
        this._renderWorkflows(content);
        break;
      case "history":
        this._renderHistory(content);
        break;
      case "eval":
        this._renderEvalSandbox(content);
        break;
    }
  }

  // Placeholder methods - to be implemented
  _renderNav(container) {}

  _renderHome(container) {}

  _renderBuilder(container) {}

  _renderPresets(container) {}

  _renderWorkflows(container) {}

  _renderHistory(container) {}

  _renderEvalSandbox(container) {}

  _showResult(result, isError) {}

  _addHistory(label, source, result, success, metadata) {}
}

module.exports = { CLICommanderView, VIEW_TYPE };