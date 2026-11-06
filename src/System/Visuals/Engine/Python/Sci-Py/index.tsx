/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { SciPyConfig, DEFAULT_SCIPY_CONFIG } from "./General/index";

/**
 * SciPy Controller.
 */
export class SciPyController {
  private config: SciPyConfig = { ...DEFAULT_SCIPY_CONFIG };
  public getStatus() {
    return { module: "SciPy", active: true, config: this.config };
  }
}

export const sciPyController = new SciPyController();
