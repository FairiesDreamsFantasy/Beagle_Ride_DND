/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Point2D } from '../2-D/index';

export interface ShadedVertex2D {
  x: number;
  y: number;
  r: number;
  g: number;
  b: number;
}

/**
 * Polygon Mathematics & N64 RDP-Inspired Gouraud Scanline Rasterizer.
 * Implements signed shoelace winding, backface culling, barycentric tests,
 * and flat + Gouraud-shaded Uint32 scanline polygon rasterizers.
 */
export const VisualAnimationPolygons = {
  triangulation: 'DELAUNAY',
  shading: 'N64_GOURAUD_SCANLINE',

  /**
   * Computes twice the signed area of a 2D polygon using the Shoelace formula.
   * Positive = Counter-Clockwise (front-facing), Negative = Clockwise.
   */
  computeSignedArea2D(vertices: Point2D[]): number {
    let area2 = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % n];
      area2 += (a.x * b.y - b.x * a.y);
    }
    return area2;
  },

  isFrontFacingCCW(a: Point2D, b: Point2D, c: Point2D): boolean {
    return ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) > 0;
  },

  isPointInTriangle(p: Point2D, a: Point2D, b: Point2D, c: Point2D): boolean {
    const crossProduct = (p1: Point2D, p2: Point2D, p3: Point2D) =>
      (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);

    const d1 = crossProduct(p, a, b);
    const d2 = crossProduct(p, b, c);
    const d3 = crossProduct(p, c, a);

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(hasNeg && hasPos);
  },

  computePolygonAABB(vertices: Point2D[]): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (let i = 0; i < vertices.length; i++) {
      const v = vertices[i];
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }

    return { minX, maxX, minY, maxY };
  },

  /**
   * Vintage Scanline Polygon Rasterizer writing directly into a pre-allocated Uint32Array framebuffer.
   * Zero heap allocations per pixel; executes clipped horizontal spans.
   */
  rasterizeConvexPolygon32(
    vertices: Point2D[],
    color32: number,
    pixelBuffer: Uint32Array,
    screenWidth: number,
    screenHeight: number
  ): void {
    const n = vertices.length;
    if (n < 3) return;

    let minY = screenHeight;
    let maxY = -1;
    for (let i = 0; i < n; i++) {
      const y = vertices[i].y;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }

    const startY = Math.max(0, Math.ceil(minY));
    const endY = Math.min(screenHeight - 1, Math.floor(maxY));

    for (let y = startY; y <= endY; y++) {
      let xMin = screenWidth;
      let xMax = -1;

      for (let i = 0; i < n; i++) {
        const v0 = vertices[i];
        const v1 = vertices[(i + 1) % n];
        if ((v0.y <= y && v1.y > y) || (v1.y <= y && v0.y > y)) {
          const t = (y - v0.y) / (v1.y - v0.y);
          const ix = v0.x + t * (v1.x - v0.x);
          if (ix < xMin) xMin = ix;
          if (ix > xMax) xMax = ix;
        }
      }

      const sx0 = Math.max(0, Math.ceil(xMin));
      const sx1 = Math.min(screenWidth - 1, Math.floor(xMax));
      if (sx0 <= sx1) {
        const rowOffset = y * screenWidth;
        pixelBuffer.fill(color32, rowOffset + sx0, rowOffset + sx1 + 1);
      }
    }
  },

  /**
   * N64 RDP-Inspired Gouraud-Shaded Triangle Rasterizer (barycentric edge-function stepping).
   * Interpolates RGB per-vertex color smoothly across triangle faces in a single Uint32Array pass.
   */
  rasterizeGouraudTriangle32(
    v0: ShadedVertex2D,
    v1: ShadedVertex2D,
    v2: ShadedVertex2D,
    pixelBuffer: Uint32Array,
    screenWidth: number,
    screenHeight: number
  ): void {
    const area = (v1.x - v0.x) * (v2.y - v0.y) - (v1.y - v0.y) * (v2.x - v0.x);
    if (Math.abs(area) < 1e-4) return;
    const invArea = 1.0 / area;

    const minX = Math.max(0, Math.floor(Math.min(v0.x, v1.x, v2.x)));
    const maxX = Math.min(screenWidth - 1, Math.ceil(Math.max(v0.x, v1.x, v2.x)));
    const minY = Math.max(0, Math.floor(Math.min(v0.y, v1.y, v2.y)));
    const maxY = Math.min(screenHeight - 1, Math.ceil(Math.max(v0.y, v1.y, v2.y)));

    for (let y = minY; y <= maxY; y++) {
      const rowOffset = y * screenWidth;
      for (let x = minX; x <= maxX; x++) {
        const w0 = ((v1.x - x) * (v2.y - y) - (v1.y - y) * (v2.x - x)) * invArea;
        const w1 = ((v2.x - x) * (v0.y - y) - (v2.y - y) * (v0.x - x)) * invArea;
        const w2 = 1.0 - w0 - w1;
        if (w0 >= 0 && w1 >= 0 && w2 >= 0) {
          const r = (v0.r * w0 + v1.r * w1 + v2.r * w2) & 0xFF;
          const g = (v0.g * w0 + v1.g * w1 + v2.g * w2) & 0xFF;
          const b = (v0.b * w0 + v1.b * w1 + v2.b * w2) & 0xFF;
          pixelBuffer[rowOffset + x] = (0xFF000000 | (b << 16) | (g << 8) | r) >>> 0;
        }
      }
    }
  }
};

export default VisualAnimationPolygons;
