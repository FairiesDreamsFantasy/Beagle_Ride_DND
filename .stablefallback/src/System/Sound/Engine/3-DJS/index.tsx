/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { ThreeJSConfig, DEFAULT_THREEJS_CONFIG } from "./General/index";

/**
 * ThreeJS Controller.
 */
export class ThreeJSController {
  private config: ThreeJSConfig = { ...DEFAULT_THREEJS_CONFIG };
  public getStatus() {
    return { module: "ThreeJS", active: true, config: this.config };
  }
}

export const threeJSController = new ThreeJSController();
