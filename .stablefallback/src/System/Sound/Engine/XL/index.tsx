/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { XLConfig, DEFAULT_XL_CONFIG } from "./General/index";

/**
 * XL Controller.
 */
export class XLController {
  private config: XLConfig = { ...DEFAULT_XL_CONFIG };
  public getStatus() {
    return { module: "XL", active: true, config: this.config };
  }
}

export const xLController = new XLController();
