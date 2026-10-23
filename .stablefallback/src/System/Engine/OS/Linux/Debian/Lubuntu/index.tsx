/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { LubuntuConfig, DEFAULT_LUBUNTU_CONFIG } from "./General/index";

/**
 * Lubuntu Controller.
 */
export class LubuntuController {
  private config: LubuntuConfig = { ...DEFAULT_LUBUNTU_CONFIG };
  public getStatus() {
    return { module: "Lubuntu", active: true, config: this.config };
  }
}

export const lubuntuController = new LubuntuController();
