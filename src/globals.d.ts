declare global {
  function require(id: string): any;

  interface HTMLElement {
    createDiv(options?: DomCreateOptions): HTMLElement;
    createSpan(options?: DomCreateOptions): HTMLElement;
    createEl<K extends keyof HTMLElementTagNameMap>(
      tag: K,
      options?: DomCreateOptions,
    ): HTMLElementTagNameMap[K];
    empty(): void;
    addClass(...classNames: string[]): void;
    removeClass(...classNames: string[]): void;
  }

  interface EventTarget {
    closest?(selector: string): Element | null;
  }

  interface Window {
    moment?: () => { format(pattern: string): string };
  }

  const process: {
    env: Record<string, string | undefined>;
  };
}

export interface DomCreateOptions {
  cls?: string;
  text?: string;
  attr?: Record<string, string>;
}

export {};
