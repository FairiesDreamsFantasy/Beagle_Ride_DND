/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface AABBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Geometric Vector Mathematics & Collision Geometry Engine.
 * Provides pure mathematical primitives for raycasts, bounds, and intersections.
 */
export const VisualAnimationGeometry = {
  topology: 'MANIFOLD',
  normals: 'CALCULATED',

  /**
   * Euclidean vector length.
   */
  vectorLength(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  /**
   * Unit vector normalization.
   */
  normalize(v: Vector2D): Vector2D {
    const len = this.vectorLength(v);
    if (len === 0) return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
  },

  /**
   * Vector dot product.
   */
  dotProduct(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
  },

  /**
   * Fast Axis-Aligned Bounding Box (AABB) intersection check.
   */
  checkAABBOverlap(boxA: AABBBox, boxB: AABBBox): boolean {
    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  },

  /**
   * Distance from point to line segment.
   */
  pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }
};

export default VisualAnimationGeometry;
