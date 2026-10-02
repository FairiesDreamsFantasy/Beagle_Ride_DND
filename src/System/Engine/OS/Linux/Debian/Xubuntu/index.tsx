/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { XubuntuConfig, DEFAULT_XUBUNTU_CONFIG } from "./General/index";

/**
 * Xubuntu Controller.
 */
export class XubuntuController {
  private config: XubuntuConfig = { ...DEFAULT_XUBUNTU_CONFIG };
  public getStatus() {
    return { module: "Xubuntu", active: true, config: this.config };
  }
}

export const xubuntuController = new XubuntuController();
