/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSharpConfig, DEFAULT_CSHARP_CONFIG } from "./General/index";

/**
 * CSharp Controller.
 */
export class CSharpController {
  private config: CSharpConfig = { ...DEFAULT_CSHARP_CONFIG };
  public getStatus() {
    return { module: "CSharp", active: true, config: this.config };
  }
}

export const cSharpController = new CSharpController();
