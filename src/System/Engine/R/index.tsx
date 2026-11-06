/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { RConfig, DEFAULT_R_CONFIG } from "./General/index";

/**
 * R Controller.
 */
export class RController {
  private config: RConfig = { ...DEFAULT_R_CONFIG };
  public getStatus() {
    return { module: "R", active: true, config: this.config };
  }
}

export const rController = new RController();
