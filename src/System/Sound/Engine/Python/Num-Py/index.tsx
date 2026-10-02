/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { NumPyConfig, DEFAULT_NUMPY_CONFIG } from "./General/index";

/**
 * NumPy Controller.
 */
export class NumPyController {
  private config: NumPyConfig = { ...DEFAULT_NUMPY_CONFIG };
  public getStatus() {
    return { module: "NumPy", active: true, config: this.config };
  }
}

export const numPyController = new NumPyController();
