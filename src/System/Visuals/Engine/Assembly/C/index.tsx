/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CConfig, DEFAULT_C_CONFIG } from "./General/index";

/**
 * High-Performance Visuals C-Engine.
 * Implements bitwise pixel packing, raw memory arenas, and fast coordinate transforms.
 */
export class VisualsAssemblyCController {
  private config: CConfig = { ...DEFAULT_C_CONFIG };
  private arena: Uint8Array = new Uint8Array(1024 * 64); // 64KB static arena
  private arenaOffset: number = 0;

  public getStatus() {
    return { 
      module: "VisualsAssemblyC", 
      active: true, 
      config: this.config, 
      arenaSize: this.arena.length,
      arenaUsed: this.arenaOffset
    };
  }

  /**
   * Packs RGBA components into a 32-bit integer for buffer blitting.
   */
  public packPixel(r: number, g: number, b: number, a: number = 255): number {
    return ((a & 0xFF) << 24) | ((b & 0xFF) << 16) | ((g & 0xFF) << 8) | (r & 0xFF);
  }

  /**
   * Linear arena allocation for transient vertex arrays (O(1)).
   */
  public malloc(bytes: number): Uint8Array {
    if (this.arenaOffset + bytes > this.arena.length) {
      this.arenaOffset = 0; // Cyclic reset for transient data
    }
    const view = this.arena.subarray(this.arenaOffset, this.arenaOffset + bytes);
    this.arenaOffset += bytes;
    return view;
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
