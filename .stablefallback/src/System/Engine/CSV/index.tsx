/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSVConfig, DEFAULT_CSV_CONFIG } from "./General/index";

/**
 * CSV Controller.
 */
export class CSVController {
  private config: CSVConfig = { ...DEFAULT_CSV_CONFIG };
  public getStatus() {
    return { module: "CSV", active: true, config: this.config };
  }
}

export const cSVController = new CSVController();
