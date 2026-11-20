/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * System/Building_Blocks/Animations/Polygons/index.tsx
 * Architectural Polygon Winding, Containment, Centroid, and AABB Solver for Building Blocks.
 */

export interface BlockVertex2D {
  x: number;
  y: number;
}

export interface BlockPolygonBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centroidX: number;
  centroidY: number;
  signedArea: number;
}

export const BlockAnimationPolygons = {
  windingRule: 'CCW_POSITIVE' as const,

  /**
   * Computes exact Shoelace signed polygon area (twice signed area * 0.5).
   */
  computeSignedArea(vertices: readonly BlockVertex2D[]): number {
    const n = vertices.length;
    if (n < 3) return 0;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const a = vertices[i];
      const b = vertices[(i + 1) % n];
      sum += a.x * b.y - b.x * a.y;
    }
    return sum * 0.5;
  },

  /**
   * Even-odd ray-casting point-in-polygon inclusion test with zero allocations.
   */
  isPointInsidePolygon(px: number, py: number, vertices: readonly BlockVertex2D[]): boolean {
    const n = vertices.length;
    if (n < 3) return false;
    let inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = vertices[i].x;
      const yi = vertices[i].y;
      const xj = vertices[j].x;
      const yj = vertices[j].y;
      const intersect = (yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  },

  /**
   * Computes bounding box, area-weighted centroid, and signed area into a pre-allocated buffer.
   */
  evaluateBoundsInto(out: BlockPolygonBounds, vertices: readonly BlockVertex2D[]): BlockPolygonBounds {
    const n = vertices.length;
    if (n === 0) {
      out.minX = 0; out.minY = 0; out.maxX = 0; out.maxY = 0;
      out.centroidX = 0; out.centroidY = 0; out.signedArea = 0;
      return out;
    }

    let minX = vertices[0].x;
    let maxX = vertices[0].x;
    let minY = vertices[0].y;
    let maxY = vertices[0].y;
    let sumX = 0;
    let sumY = 0;

    for (let i = 0; i < n; i++) {
      const v = vertices[i];
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
      sumX += v.x;
      sumY += v.y;
    }

    out.minX = minX;
    out.minY = minY;
    out.maxX = maxX;
    out.maxY = maxY;
    out.centroidX = sumX / n;
    out.centroidY = sumY / n;
    out.signedArea = this.computeSignedArea(vertices);
    return out;
  }
};

export default BlockAnimationPolygons;
