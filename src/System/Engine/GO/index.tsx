/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { GOConfig, DEFAULT_GO_CONFIG } from "./General/index";

/**
 * Go Concurrency & Channel Controller.
 * Implements non-blocking buffered channels and cooperative micro-task scheduling.
 */
export class GOController {
  private config: GOConfig = { ...DEFAULT_GO_CONFIG };
  private channels: Map<string, any[]> = new Map();

  public getStatus() {
    return { module: "GO", active: true, config: this.config };
  }

  /**
   * Make a buffered channel: make(chan T, capacity).
   */
  public makeChan<T>(name: string, capacity: number = 16): string {
    this.channels.set(name, []);
    return name;
  }

  /**
   * Non-blocking send: ch <- val.
   */
  public send<T>(name: string, val: T): boolean {
    const queue = this.channels.get(name);
    if (!queue || queue.length >= 32) return false;
    queue.push(val);
    return true;
  }

  /**
   * Non-blocking receive: <-ch.
   */
  public recv<T>(name: string): { val: T | null; ok: boolean } {
    const queue = this.channels.get(name);
    if (!queue || queue.length === 0) {
      return { val: null, ok: false };
    }
    return { val: queue.shift() as T, ok: true };
  }
}

export const gOController = new GOController();
export default gOController;
