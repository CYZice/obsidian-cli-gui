// @ts-nocheck
const obsidian = require("obsidian");
const { renderNav, showResult, renderResultContent, renderJsonTable, renderJsonKV, confirmDanger, addHistory, savePreset } = require("../view-helpers");
const { renderEvalSandbox } = require("../view/pages/eval");
const { renderHome, renderSearchResults, renderHomeItemCard, renderUserPreset } = require("../view/pages/home");
const {
  renderBuilder,
  renderCmdList,
  refreshCmdList,
  renderCmdItem,
  renderCmdBuilder,
  renderParam,
  attachFilePicker,
  attachSubpathPicker,
  attachFolderPicker,
  getTemplateFolder,
  getTemplateFiles,
  attachTemplatePicker,
  exec,
} = require("../view/pages/builder");
const { renderPresets, refreshPresetList, renderPresetsBody, renderPresetCard } = require("../view/pages/presets");
const { renderWorkflows, formatScheduleDesc, renderWorkflowEditor } = require("../view/pages/workflows");
const { renderHistory } = require("../view/pages/history");

const VIEW_TYPE = "cli-commander-view";

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
    this._cleanups.forEach((cleanup) => cleanup());
    this._cleanups = [];
  }

  _on(element, eventName, listener) {
    element.addEventListener(eventName, listener);
    this._cleanups.push(() => element.removeEventListener(eventName, listener));
  }

  render() {
    this._clean();
    this.containerEl.empty();

    const root = this.containerEl.createDiv({ cls: "cli-root" });
    this._renderNav(root);
    this._resultPanel = root.createDiv({ cls: "cli-result-panel is-hidden" });

    const content = root.createDiv({ cls: "cli-content" });
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

  _renderNav(container) {
    return renderNav.call(this, container);
  }

  _renderEvalSandbox(container) {
    return renderEvalSandbox.call(this, container);
  }

  _renderHome(container) {
    return renderHome.call(this, container);
  }

  _renderSearchResults(container) {
    return renderSearchResults.call(this, container);
  }

  _renderBuilder(container) {
    return renderBuilder.call(this, container);
  }

  _renderCmdList(container, commands) {
    return renderCmdList.call(this, container, commands);
  }

  _refreshCmdList() {
    return refreshCmdList.call(this);
  }

  _renderCmdItem(container, command) {
    return renderCmdItem.call(this, container, command);
  }

  _renderCmdBuilder(container) {
    return renderCmdBuilder.call(this, container);
  }

  _renderParam(container, param, command) {
    return renderParam.call(this, container, param, command);
  }

  _attachFilePicker(input, paramName) {
    return attachFilePicker.call(this, input, paramName);
  }

  _attachSubpathPicker(input, filePath, pickFolder) {
    return attachSubpathPicker.call(this, input, filePath, pickFolder);
  }

  _attachFolderPicker(input) {
    return attachFolderPicker.call(this, input);
  }

  _getTemplateFolder() {
    return getTemplateFolder.call(this);
  }

  _getTemplateFiles() {
    return getTemplateFiles.call(this);
  }

  _attachTemplatePicker(input) {
    return attachTemplatePicker.call(this, input);
  }

  _exec(command) {
    return exec.call(this, command);
  }

  _showResult(result, isError) {
    return showResult.call(this, result, isError);
  }

  _renderResultContent(container, result) {
    return renderResultContent.call(this, container, result);
  }

  _renderJsonTable(container, data) {
    return renderJsonTable.call(this, container, data);
  }

  _renderJsonKV(container, key, value) {
    return renderJsonKV.call(this, container, key, value);
  }

  _confirmDanger(target, action) {
    return confirmDanger.call(this, target, action);
  }

  _savePreset(command, values) {
    return savePreset.call(this, command, values);
  }

  _addHistory(command, commandMeta, result, success, workflow) {
    return addHistory.call(this, command, commandMeta, result, success, workflow);
  }

  _renderPresets(container) {
    return renderPresets.call(this, container);
  }

  _refreshPresetList() {
    return refreshPresetList.call(this);
  }

  _renderPresetsBody(container) {
    return renderPresetsBody.call(this, container);
  }

  _renderPresetCard(container, preset, isBuiltin, index, orderedIds, onRemove, onMove) {
    return renderPresetCard.call(this, container, preset, isBuiltin, index, orderedIds, onRemove, onMove);
  }

  _renderHomeItemCard(container, item, index, orderedIds, onRemove, onMove) {
    return renderHomeItemCard.call(this, container, item, index, orderedIds, onRemove, onMove);
  }

  _renderUserPreset(container, preset, index) {
    return renderUserPreset.call(this, container, preset, index);
  }

  _renderWorkflows(container) {
    return renderWorkflows.call(this, container);
  }

  _formatScheduleDesc(schedule) {
    return formatScheduleDesc.call(this, schedule);
  }

  _renderWorkflowEditor(container) {
    return renderWorkflowEditor.call(this, container);
  }

  async _runWorkflow(workflow) {
    const { combined, success } = await this.plugin.runWorkflow(workflow);
    this._showResult(combined, !success);
    this._addHistory(
      workflow.steps.map((step) => step.label || step.command).join(" → "),
      { id: "workflow", name: "序列: " + workflow.name },
      combined,
      success,
      workflow,
    );
  }

  static _getDragLine() {
    let line = document.getElementById("cli-drag-line");
    if (!line) {
      line = document.createElement("div");
      line.id = "cli-drag-line";
      line.style.cssText =
        "position:fixed;left:0;right:0;height:2px;background:red;pointer-events:none;z-index:9999;display:none;border-radius:2px;";
      document.body.appendChild(line);
    }
    return line;
  }

  static _showDragLine(element, after) {
    const line = CLICommanderView._getDragLine();
    const rect = element.getBoundingClientRect();
    const top = after ? rect.bottom : rect.top;
    line.style.top = top - 1 + "px";
    line.style.left = rect.left + "px";
    line.style.right = window.innerWidth - rect.right + "px";
    line.style.display = "block";
  }

  static _hideDragLine() {
    const line = document.getElementById("cli-drag-line");
    if (line) {
      line.style.display = "none";
    }
  }

  _renderHistory(container) {
    return renderHistory.call(this, container);
  }
}

export { CLICommanderView, VIEW_TYPE };
