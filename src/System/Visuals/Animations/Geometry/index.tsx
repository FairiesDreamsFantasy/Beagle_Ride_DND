/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GeometryModule } from '../../../Engine/Mathematics/Geometry/index';

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

export interface BarycentricCoords {
  u: number;
  v: number;
  w: number;
  inside: boolean;
}

/**
 * High-Precision Computational Geometry, Projective Scale & Spatial Hashing Engine.
 * Zero-allocation vector primitives supporting arbitrary screen aspect ratios without distortion.
 */
export const VisualAnimationGeometry = {
  topology: 'MANIFOLD',
  normals: 'CALCULATED',

  spatialHash2D(tx: number, ty: number): number {
    return GeometryModule.spatialHash2D(tx, ty);
  },

  quantizeToGrid(coord: number, cellSize: number): number {
    return GeometryModule.quantizeGrid(coord, cellSize);
  },

  /**
   * Computes exact uniform scale to project a virtual canvas (default 320x180)
   * onto any physical framebuffer size without horizontal/vertical clipping or distortion.
   */
  computeUniformSpriteFitScale(
    renderWidth: number,
    renderHeight: number,
    virtualWidth: number = 320,
    virtualHeight: number = 180
  ): number {
    if (renderWidth <= 0 || renderHeight <= 0) return 1.0;
    const heightScale = renderHeight / virtualHeight;
    // Guarantee full canine shoulder span (~220 virtual units) fits inside narrow portrait viewports
    const safeWidthScale = renderWidth / Math.min(virtualWidth, 220);
    return heightScale < safeWidthScale ? heightScale : safeWidthScale;
  },

  computeHorizonRow(renderHeight: number, horizonOffsetVirtual: number, spriteScale: number): number {
    return Math.floor(renderHeight * 0.5) + Math.floor(horizonOffsetVirtual * spriteScale);
  },

  vectorLength(v: Vector2D): number {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  },

  distanceSq(ax: number, ay: number, bx: number, by: number): number {
    return GeometryModule.distanceSq2D(ax, ay, bx, by);
  },

  normalize(v: Vector2D): Vector2D {
    const len = Math.sqrt(v.x * v.x + v.y * v.y);
    if (len <= 1e-12) return { x: 0, y: 0 };
    const invLen = 1.0 / len;
    return { x: v.x * invLen, y: v.y * invLen };
  },

  dotProduct(a: Vector2D, b: Vector2D): number {
    return a.x * b.x + a.y * b.y;
  },

  orient2D(a: Vector2D, b: Vector2D, c: Vector2D): number {
    return GeometryModule.orient2D(a.x, a.y, b.x, b.y, c.x, c.y);
  },

  /**
   * Exact barycentric coordinate solver for triangle (a, b, c) and sample point p.
   */
  computeBarycentric2D(p: Vector2D, a: Vector2D, b: Vector2D, c: Vector2D): BarycentricCoords {
    const v0x = b.x - a.x;
    const v0y = b.y - a.y;
    const v1x = c.x - a.x;
    const v1y = c.y - a.y;
    const v2x = p.x - a.x;
    const v2y = p.y - a.y;

    const denom = v0x * v1y - v1x * v0y;
    if (Math.abs(denom) <= 1e-12) {
      return { u: 0, v: 0, w: 0, inside: false };
    }
    const invDenom = 1.0 / denom;
    const v = (v2x * v1y - v1x * v2y) * invDenom;
    const w = (v0x * v2y - v2x * v0y) * invDenom;
    const u = 1.0 - v - w;
    return { u, v, w, inside: u >= 0 && v >= 0 && w >= 0 };
  },

  /**
   * Inverse-square distance attenuation factor clamped to [minAtten, 1.0].
   */
  computeDistanceAttenuation(distance: number, halfFalloff: number = 120, minAtten: number = 0.2): number {
    const ratio = distance / Math.max(1, halfFalloff);
    const atten = 1.0 / (1.0 + ratio * ratio);
    return atten < minAtten ? minAtten : atten;
  },

  checkAABBOverlap(boxA: AABBBox, boxB: AABBBox): boolean {
    return (
      boxA.x < boxB.x + boxB.width &&
      boxA.x + boxA.width > boxB.x &&
      boxA.y < boxB.y + boxB.height &&
      boxA.y + boxA.height > boxB.y
    );
  },

  /**
   * Kay-Kajiya Slab Ray-AABB intersection test.
   */
  intersectRayAABB(
    ox: number, oy: number,
    invDx: number, invDy: number,
    box: AABBBox
  ): boolean {
    const t1 = (box.x - ox) * invDx;
    const t2 = (box.x + box.width - ox) * invDx;
    const t3 = (box.y - oy) * invDy;
    const t4 = (box.y + box.height - oy) * invDy;
    const tmin = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    const tmax = Math.min(Math.max(t1, t2), Math.max(t3, t4));
    return tmax >= 0 && tmin <= tmax;
  },

  /**
   * Exact parametric 2D line segment intersection (p1->p2 vs p3->p4).
   */
  intersectSegments2D(p1: Vector2D, p2: Vector2D, p3: Vector2D, p4: Vector2D): Vector2D | null {
    const s1x = p2.x - p1.x;
    const s1y = p2.y - p1.y;
    const s2x = p4.x - p3.x;
    const s2y = p4.y - p3.y;
    const denom = -s2x * s1y + s1x * s2y;
    if (Math.abs(denom) <= 1e-12) return null;
    const invDenom = 1.0 / denom;
    const s = (-s1y * (p1.x - p3.x) + s1x * (p1.y - p3.y)) * invDenom;
    const t = (s2x * (p1.y - p3.y) - s2y * (p1.x - p3.x)) * invDenom;
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
      return { x: p1.x + t * s1x, y: p1.y + t * s1y };
    }
    return null;
  },

  pointToSegmentDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
    if (l2 === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
  }
};

export default VisualAnimationGeometry;
