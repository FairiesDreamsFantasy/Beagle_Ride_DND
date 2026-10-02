/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * ThreeJS Specifications.
 */
export interface ThreeJSConfig {
  type: string;
  version: string;
  stability: "STABLE";
}

export const DEFAULT_THREEJS_CONFIG: Readonly<ThreeJSConfig> = Object.freeze({
  type: "ThreeJS",
  version: "1.0.0",
  stability: "STABLE"
});
