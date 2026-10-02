/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * C Controller.
 */
export class CController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };
  public getStatus() {
    return { module: "C", active: true, config: this.config };
  }
}

export const cController = new CController();
