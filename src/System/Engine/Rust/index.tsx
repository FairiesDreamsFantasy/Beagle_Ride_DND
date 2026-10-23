/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { RustConfig, DEFAULT_RUST_CONFIG } from "./General/index";

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export type Option<T> = { some: true; value: T } | { some: false };

/**
 * Rust Memory Safety & Channel Controller.
 * Implements deterministic Result/Option types and lockless MPSC ring-channel message passing.
 */
export class RustController {
  private config: RustConfig = { ...DEFAULT_RUST_CONFIG };
  private channels: Map<string, any[]> = new Map();

  public getStatus() {
    return { module: "Rust", active: true, config: this.config, activeChannels: this.channels.size };
  }

  public Ok<T, E = never>(value: T): Result<T, E> {
    return { ok: true, value };
  }

  public Err<E, T = never>(error: E): Result<T, E> {
    return { ok: false, error };
  }

  public Some<T>(value: T): Option<T> {
    return { some: true, value };
  }

  public None<T = never>(): Option<T> {
    return { some: false };
  }

  /**
   * MPSC Channel Send: non-blocking, O(1) push to channel queue.
   */
  public send<T>(channelName: string, message: T): boolean {
    let queue = this.channels.get(channelName);
    if (!queue) {
      queue = [];
      this.channels.set(channelName, queue);
    }
    if (queue.length >= 256) return false; // Fixed ring-bound
    queue.push(message);
    return true;
  }

  /**
   * MPSC Channel Receive: non-blocking, O(1) shift from channel queue.
   */
  public recv<T>(channelName: string): Option<T> {
    const queue = this.channels.get(channelName);
    if (!queue || queue.length === 0) {
      return this.None();
    }
    return this.Some(queue.shift() as T);
  }
}

export const rustController = new RustController();
export default rustController;
