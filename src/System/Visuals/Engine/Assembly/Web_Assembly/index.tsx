/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { WebAssemblyConfig, DEFAULT_WEBASSEMBLY_CONFIG } from "./General/index";

/**
 * WebAssembly Controller.
 */
export class WebAssemblyController {
  private config: WebAssemblyConfig = { ...DEFAULT_WEBASSEMBLY_CONFIG };
  public getStatus() {
    return { module: "WebAssembly", active: true, config: this.config };
  }
}

export const webAssemblyController = new WebAssemblyController();
