declare module "obsidian" {
  export class Notice {
    constructor(message: string, timeout?: number);
  }

  export class TAbstractFile {
    path: string;
    name: string;
    parent: TFolder | null;
  }

  export class TFolder extends TAbstractFile {
    children: TAbstractFile[];
  }

  export class TFile extends TAbstractFile {
    basename: string;
    extension: string;
    stat: {
      size: number;
      mtime: number;
    };
  }

  export interface Vault {
    adapter: { basePath?: string };
    config?: Record<string, unknown>;
    getConfig?(key: string): unknown;
    getAbstractFileByPath(path: string): TAbstractFile | null;
    getFiles(): TFile[];
    getMarkdownFiles(): TFile[];
    create(path: string, content: string): Promise<TFile>;
    createFolder(path: string): Promise<void>;
    read(file: TAbstractFile): Promise<string>;
    cachedRead(file: TFile): Promise<string>;
    modify(file: TAbstractFile, content: string): Promise<void>;
  }

  export interface MetadataCache {
    resolvedLinks: Record<string, Record<string, number>>;
    getFileCache(file: TFile): {
      frontmatter?: Record<string, unknown>;
      sections?: unknown[];
    } | null;
    getFirstLinkpathDest(path: string, sourcePath: string): TFile | null;
    getTags(): Record<string, number> | null;
  }

  export interface WorkspaceLeaf {
    view?: unknown;
    setViewState(state: { type: string; active?: boolean }): Promise<void>;
  }

  export interface Workspace {
    on(name: "file-menu", callback: (menu: Menu, file: TFile) => void): unknown;
    on(name: string, callback: (...args: unknown[]) => void): unknown;
    getLeftLeaf(split: boolean): WorkspaceLeaf | null;
    getLeavesOfType(type: string): WorkspaceLeaf[];
    revealLeaf(leaf: WorkspaceLeaf): void;
    getActiveFile(): TFile | null;
  }

  export interface App {
    vault: Vault;
    workspace: Workspace;
    metadataCache: MetadataCache;
    internalPlugins?: {
      getPluginById(id: string): { instance?: { options?: Record<string, unknown> } } | null;
    };
    plugins: {
      plugins?: Record<string, unknown>;
      enabledPlugins: Set<string>;
    };
  }

  export class Plugin {
    app: App;
    addRibbonIcon(icon: string, title: string, callback: () => void): void;
    addCommand(command: {
      id: string;
      name: string;
      callback: () => void | Promise<void>;
    }): void;
    addSettingTab(tab: PluginSettingTab): void;
    registerView(type: string, creator: (leaf: WorkspaceLeaf) => ItemView): void;
    registerEvent(eventRef: unknown): void;
    loadData(): Promise<unknown>;
    saveData(data: unknown): Promise<void>;
  }

  export class ItemView {
    app: App;
    leaf: WorkspaceLeaf;
    containerEl: HTMLElement;
    constructor(leaf: WorkspaceLeaf);
  }

  export class Modal {
    app: App;
    contentEl: HTMLElement;
    constructor(app: App);
    open(): void;
    close(): void;
  }

  export class PluginSettingTab {
    app: App;
    plugin: Plugin;
    containerEl: HTMLElement;
    constructor(app: App, plugin: Plugin);
  }

  export class Setting {
    constructor(containerEl: HTMLElement);
    setName(name: string): this;
    setDesc(desc: string): this;
    addToggle(callback: (component: ToggleComponent) => void): this;
    addText(callback: (component: TextComponent) => void): this;
    addDropdown(callback: (component: DropdownComponent) => void): this;
    addButton(callback: (component: ButtonComponent) => void): this;
  }

  export interface ToggleComponent {
    setValue(value: boolean): this;
    onChange(callback: (value: boolean) => void | Promise<void>): this;
  }

  export interface TextComponent {
    setValue(value: string): this;
    onChange(callback: (value: string) => void | Promise<void>): this;
  }

  export interface DropdownComponent {
    addOption(value: string, label: string): this;
    setValue(value: string): this;
    onChange(callback: (value: string) => void | Promise<void>): this;
  }

  export interface ButtonComponent {
    setButtonText(label: string): this;
    setWarning(): this;
    onClick(callback: () => void | Promise<void>): this;
  }

  export interface MenuItem {
    setTitle(title: string): this;
    setIcon(icon: string): this;
    onClick(callback: () => void | Promise<void>): this;
  }

  export interface Menu {
    addItem(callback: (item: MenuItem) => void): void;
  }

  export function setIcon(el: HTMLElement, icon: string): void;
}

declare module "node:module" {
  export const builtinModules: string[];
}

declare module "path" {
  export function join(...parts: string[]): string;
}

declare module "fs" {
  export function existsSync(path: string): boolean;
}

declare module "child_process" {
  export function exec(
    command: string,
    options: {
      timeout?: number;
      maxBuffer?: number;
      encoding?: string;
      env?: Record<string, string | undefined>;
      cwd?: string;
      shell?: string;
    },
    callback: (error: Error | null, stdout: string, stderr: string) => void,
  ): void;

  export function execSync(command: string, options?: { timeout?: number }): {
    toString(): string;
  };
}
