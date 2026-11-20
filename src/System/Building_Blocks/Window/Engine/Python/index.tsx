/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/System/Building_Blocks/Window/Engine/Python/index.tsx
 * Domain: Fresnel Glazing & Sill Spec (Python Kernel)
 */

export class PythonEngine {
  public static status = "Operational";
  public static readonly domain = "Building_Blocks/Window";
  public static readonly defaultUnit = 12;

  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  public static dot2(ax: number, ay: number, bx: number, by: number): number {
    return ax * bx + ay * by;
  }

  public static signedTriangleArea2D(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
    return 0.5 * ((bx - ax) * (cy - ay) - (cx - ax) * (by - ay));
  }

  public static clampInto(src: Float32Array, dst: Float32Array, minVal: number, maxVal: number): void {
    const n = Math.min(src.length, dst.length);
    for (let i = 0; i < n; i++) {
      const v = src[i];
      dst[i] = v < minVal ? minVal : v > maxVal ? maxVal : v;
    }
  }
}
