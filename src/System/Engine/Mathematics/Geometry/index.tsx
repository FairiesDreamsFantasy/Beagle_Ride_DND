/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const GeometryModule = {
  calculateArea: (r: number): number => Math.PI * r * r,
  calculatePerimeter: (r: number): number => 2 * Math.PI * r,
  dot2D: (ax: number, ay: number, bx: number, by: number): number => ax * bx + ay * by,
  cross2D: (ax: number, ay: number, bx: number, by: number): number => ax * by - ay * bx,
  distanceSq2D: (ax: number, ay: number, bx: number, by: number): number => {
    const dx = bx - ax;
    const dy = by - ay;
    return dx * dx + dy * dy;
  },
  orient2D: (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number => {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  },
  quantizeGrid: (coord: number, cellSize: number): number => Math.floor(coord / cellSize),
  aspectFitScale: (containerW: number, containerH: number, refW: number, refH: number): number => {
    if (containerW <= 0 || containerH <= 0 || refW <= 0 || refH <= 0) return 1;
    const sx = containerW / refW;
    const sy = containerH / refH;
    return sx < sy ? sx : sy;
  },
  spatialHash2D: (tx: number, ty: number): number => {
    // Deterministic integer XOR-prime spatial hash normalized to [0, 1) without Math.sin
    let h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0;
    h = ((h ^ (h >>> 16)) * 0x45d9f3b) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h / 4294967296;
  }
};
