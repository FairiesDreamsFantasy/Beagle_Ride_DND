/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { XMLConfig, DEFAULT_XML_CONFIG } from "./General/index";

/**
 * XML Controller.
 */
export class XMLController {
  private config: XMLConfig = { ...DEFAULT_XML_CONFIG };
  public getStatus() {
    return { module: "XML", active: true, config: this.config };
  }
}

export const xMLController = new XMLController();
