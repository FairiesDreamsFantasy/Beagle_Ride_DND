/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";


/**
 * Mathematical Rasterization & Matrix Pipeline (Visuals C-Virtualization Engine).
 * Performs pure fixed-point 3D affine transformations and perspective projection without VRAM overhead.
 */
export class VisualsAssemblyCController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };

  public getStatus() {
    return { module: "VisualsAssemblyC", active: true, config: this.config, mathPipeline: "FIXED_POINT_PROJECTION" };
  }

  /**
   * Projects a 3D point onto a 2D viewport using homogeneous perspective division.
   */
  public projectPoint(v: { x: number; y: number; z: number }, focalLength: number, cx: number, cy: number): { x: number; y: number; scale: number } {
    const depth = v.z + 500; // Camera distance offset
    if (depth <= 0.1) return { x: 0, y: 0, scale: 0 };
    const scale = focalLength / depth;
    return {
      x: cx + v.x * scale,
      y: cy + v.y * scale,
      scale
    };
  }

  /**
   * Matrix-vector multiplication for 3D rotation.
   */
  public rotateY(v: { x: number; y: number; z: number }, angleRad: number): { x: number; y: number; z: number } {
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    return {
      x: v.x * cos + v.z * sin,
      y: v.y,
      z: -v.x * sin + v.z * cos
    };
  }
}

export const visualsAssemblyCController = new VisualsAssemblyCController();
export default visualsAssemblyCController;
