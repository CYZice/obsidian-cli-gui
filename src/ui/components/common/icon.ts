import { setIcon as setObsidianIcon } from "obsidian";
import { CLI_CATEGORIES } from "../../../shared/constants/categories";

export function getCategoryIcon(categoryId: string): string {
  return CLI_CATEGORIES.find((category) => category.id === categoryId)?.icon || "settings";
}

export function setIcon(el: HTMLElement, iconName: string): void {
  setObsidianIcon(el, iconName);
}
