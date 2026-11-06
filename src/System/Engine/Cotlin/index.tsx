/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CotlinConfig, DEFAULT_COTLIN_CONFIG } from "./General/index";

/**
 * Cotlin Controller.
 */
export class CotlinController {
  private config: CotlinConfig = { ...DEFAULT_COTLIN_CONFIG };
  public getStatus() {
    return { module: "Cotlin", active: true, config: this.config };
  }
}

export const cotlinController = new CotlinController();
