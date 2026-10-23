/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/DOM/index.tsx
 * High-Performance DOM Virtualization & Element Caching Controller.
 * Minimizes layout reflows and optimizes DOM manipulation for low-spec machines.
 */

export class DOMVirtualizationController {
  private elementCache: Map<string, HTMLElement> = new Map();

  public getCachedElement(id: string): HTMLElement | null {
    let el = this.elementCache.get(id);
    if (!el && typeof document !== 'undefined') {
      el = document.getElementById(id) || undefined;
      if (el) {
        this.elementCache.set(id, el);
      }
    }
    return el || null;
  }

  public clearCache(): void {
    this.elementCache.clear();
  }

  public batchStyleUpdate(element: HTMLElement, styles: Record<string, string>): void {
    const styleObj = element.style;
    for (const [key, val] of Object.entries(styles)) {
      (styleObj as any)[key] = val;
    }
  }
}

export const domVirtualizationController = new DOMVirtualizationController();
export default domVirtualizationController;
