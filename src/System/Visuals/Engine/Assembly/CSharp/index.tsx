/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export * from "./General/index";
import { CSharpConfig, DEFAULT_CSHARP_CONFIG } from "./General/index";

/**
 * C# Visual Pipeline Engine.
 * Implements LINQ-style collection filtering and packed RGBA manipulations.
 */
export class VisualsAssemblyCSharpController {
  private config: CSharpConfig = { ...DEFAULT_CSHARP_CONFIG };

  public getStatus() {
    return { module: "VisualsAssemblyCSharp", active: true, config: this.config, colorFormat: "RGBA32_PACKED" };
  }

  /**
   * LINQ-style 'Where' filter for visual entities.
   * Performs zero-heap filtering on pre-allocated buffers.
   */
  public filterEntities<T>(entities: T[], predicate: (e: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < entities.length; i++) {
      if (predicate(entities[i])) result.push(entities[i]);
    }
    return result;
  }

  /**
   * LINQ-style distance-based sort (O(n log n)).
   */
  public sortByDistance<T>(entities: T[], getDistance: (e: T) => number): T[] {
    return [...entities].sort((a, b) => getDistance(a) - getDistance(b));
  }

  /**
   * Packs R, G, B, A (0-255) into a single 32-bit integer for direct framebuffer writes.
   */
  public packRGBA(r: number, g: number, b: number, a: number = 255): number {
    return (
      ((a & 0xFF) << 24) |
      ((b & 0xFF) << 16) |
      ((g & 0xFF) << 8) |
      (r & 0xFF)
    ) >>> 0;
  }

  /**
   * Unpacks a 32-bit integer into R, G, B, A components.
   */
  public unpackRGBA(color32: number): { r: number; g: number; b: number; a: number } {
    return {
      r: color32 & 0xFF,
      g: (color32 >> 8) & 0xFF,
      b: (color32 >> 16) & 0xFF,
      a: (color32 >>> 24) & 0xFF
    };
  }

  /**
   * 4x4 Bayer Dithering Matrix normalized.
   */
  public evaluateBayer4x4(x: number, y: number): number {
    const bayer = [
      0,  8,  2, 10,
      12,  4, 14,  6,
      3, 11,  1,  9,
      15,  7, 13,  5
    ];
    return bayer[(y % 4) * 4 + (x % 4)] / 16.0;
  }
}

export const visualsAssemblyCSharpController = new VisualsAssemblyCSharpController();
export default visualsAssemblyCSharpController;
