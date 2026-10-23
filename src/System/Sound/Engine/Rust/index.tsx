/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { RustConfig, DEFAULT_RUST_CONFIG } from "./General/index";

/**
 * Rust Controller.
 */
export class RustController {
  private config: RustConfig = { ...DEFAULT_RUST_CONFIG };
  public getStatus() {
    return { module: "Rust", active: true, config: this.config };
  }
}

export const rustController = new RustController();
