/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Point2D } from '../2-D/index';

/**
 * Polygon Mathematics & Rasterization Engine.
 * Implements barycentric coordinate calculations and bounding hull testing.
 */
export const VisualAnimationPolygons = {
  triangulation: 'DELAUNAY',
  shading: 'PHONG',

  /**
   * Evaluates if point P is inside triangle (A, B, C) using edge cross products.
   */
  isPointInTriangle(p: Point2D, a: Point2D, b: Point2D, c: Point2D): boolean {
    const crossProduct = (p1: Point2D, p2: Point2D, p3: Point2D) => {
      return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    };

    const d1 = crossProduct(p, a, b);
    const d2 = crossProduct(p, b, c);
    const d3 = crossProduct(p, c, a);

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return !(hasNeg && hasPos);
  },

  /**
   * Computes Axis-Aligned Bounding Box (AABB) for a set of polygon vertices.
   */
  computePolygonAABB(vertices: Point2D[]): { minX: number; maxX: number; minY: number; maxY: number } {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }

    return { minX, maxX, minY, maxY };
  }
};

export default VisualAnimationPolygons;
