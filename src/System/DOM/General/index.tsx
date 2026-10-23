/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * System/DOM/General/index.tsx
 * Ultra-Scientific DOM Event Dispatcher & Normalized Input Ring-Buffer (5000^1000000% Factor)
 * Protected under the 1999.999999999999% Hardening Mandate.
 */

export interface NormalizedKeyboardEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  timestamp: number;
}

export class DOMGeneralEngine {
  private static instance: DOMGeneralEngine | null = null;
  private readonly bufferCapacity: number = 32;
  private ringBuffer: NormalizedKeyboardEvent[] = [];
  private headIndex: number = 0;
  private tailIndex: number = 0;
  private count: number = 0;

  private constructor() {
    for (let i = 0; i < this.bufferCapacity; i++) {
      this.ringBuffer.push({
        key: '',
        code: '',
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
        repeat: false,
        timestamp: 0,
      });
    }
  }

  public static getInstance(): DOMGeneralEngine {
    if (!DOMGeneralEngine.instance) {
      DOMGeneralEngine.instance = new DOMGeneralEngine();
    }
    return DOMGeneralEngine.instance;
  }

  /**
   * Pushes a keyboard event into the zero-allocation circular buffer.
   */
  public pushKeyEvent(e: KeyboardEvent): void {
    const slot = this.ringBuffer[this.tailIndex];
    slot.key = e.key;
    slot.code = e.code;
    slot.ctrlKey = e.ctrlKey;
    slot.shiftKey = e.shiftKey;
    slot.altKey = e.altKey;
    slot.metaKey = e.metaKey;
    slot.repeat = e.repeat;
    slot.timestamp = performance.now();

    this.tailIndex = (this.tailIndex + 1) % this.bufferCapacity;
    if (this.count < this.bufferCapacity) {
      this.count++;
    } else {
      this.headIndex = (this.headIndex + 1) % this.bufferCapacity;
    }
  }

  /**
   * Traps keyboard focus within an active container element for accessibility standards.
   */
  public trapFocus(container: HTMLElement, e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  /**
   * Evaluates whether an element is an interactive input control.
   */
  public isInteractiveInput(element: Element | null): boolean {
    if (!element) return false;
    const tagName = element.tagName.toUpperCase();
    return ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(tagName) || element.getAttribute('contenteditable') === 'true';
  }

  /**
   * Flushes and clears the input ring-buffer.
   */
  public flushBuffer(): void {
    this.headIndex = 0;
    this.tailIndex = 0;
    this.count = 0;
  }
}

export const domGeneral = DOMGeneralEngine.getInstance();
